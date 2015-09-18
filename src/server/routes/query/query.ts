'use strict';

import * as path from 'path';
import { readFileSync } from 'fs';
import { Router, Request, Response } from 'express';
import { $, Expression, External, Datum, Dataset, TimeRange, basicExecutorFactory, Executor, AttributeJSs, helper } from 'plywood';
import { druidRequesterFactory } from 'plywood-druid-requester';
import { Timezone, WallTime, Duration } from "chronoshift";
import { DataSource } from '../../../common/models/index';

import { DRUID_HOST, DATA_SOURCES } from '../../config';

var router = Router();

var druidRequester = druidRequesterFactory({
  host: DRUID_HOST,
  timeout: 30000
});

//druidRequester = helper.verboseRequesterFactory({
//  requester: druidRequester
//});

function getFileData(filename: string): any[] {
  var filePath = path.join(__dirname, '../../../../', filename);
  var fileData: string = null;
  try {
    fileData = readFileSync(filePath, 'utf-8');
  } catch (e) {
    console.log('could not find', filePath);
    process.exit(1);
  }

  var fileJSON: any[] = null;
  if (fileData[0] === '[') {
    try {
      fileJSON = JSON.parse(fileData);
    } catch (e) {
      console.log('error', e.message);
      console.log('could not parse', filePath);
      process.exit(1);
    }

  } else {
    var fileLines = fileData.split('\n');
    if (fileLines[fileLines.length - 1] === '') fileLines.pop();

    fileJSON = fileLines.map((line, i) => {
      try {
        return JSON.parse(line);
      } catch (e) {
        console.log(`problem in line: ${i}: '${line}'`);
        console.log('could not parse', filePath);
        process.exit(1);
      }
    });
  }

  fileJSON.forEach((d: Datum, i: number) => {
    d['time'] = new Date(d['time']);
  });

  return fileJSON;
}

function makeExternal(dataSource: DataSource): External {
  var attributes: AttributeJSs = {};

  // Right here we have the classic mega hack.
  dataSource.dimensions.forEach((dimension) => {
    attributes[dimension.name] = { type: dimension.type };
  });

  dataSource.measures.forEach((measure) => {
    var expression = measure.expression;
    var freeReferences = expression.getFreeReferences();
    for (var freeReference of freeReferences) {
      if (freeReference === 'main') continue;
      if (JSON.stringify(expression).indexOf('countDistinct') !== -1) {
        attributes[freeReference] = { special: 'unique' };
      } else {
        attributes[freeReference] = { type: 'NUMBER' };
      }
    }
  });
  // Mega hack ends here

  return External.fromJS({
    engine: 'druid',
    dataSource: dataSource.source,
    timeAttribute: dataSource.timeAttribute.name,
    context: null,
    attributes,
    requester: druidRequester
  });
}

var executors: Lookup<Executor> = {};

for (var dataSource of DATA_SOURCES) {
  switch (dataSource.engine) {
    case 'native':
      executors[dataSource.name] = basicExecutorFactory({
        datasets: { main: Dataset.fromJS(getFileData(dataSource.source)).hide() }
      });
      break;

    case 'druid':
      executors[dataSource.name] = basicExecutorFactory({
        datasets: { main: makeExternal(dataSource) }
      });
      break;

    default:
      console.log(`Invalid engine: '${dataSource.engine}' in '${dataSource.name}'`);
      process.exit(1);
  }
}

router.post('/', (req: Request, res: Response) => {
  var { dataset, expression } = req.body;

  if (typeof dataset !== 'string') {
    res.status(400).send({ error: 'must have a string dataset' });
    return;
  }

  var executor = executors[dataset];
  if (!executor) {
    res.status(400).send({ error: 'unknown dataset' });
    return;
  }

  var ex: Expression = null;
  try {
    ex = Expression.fromJS(expression);
  } catch (e) {
    res.status(400).send({
      error: 'bad expression',
      message: e.message
    });
    return;
  }

  executor(ex).then(
    (data: Dataset) => {
      res.send(data.toJS());
    },
    (e: Error) => {
      console.log('error:', e.message);
      if (e.hasOwnProperty('stack')) {
        console.log((<any>e).stack);
      }
      res.status(500).send({
        error: 'could not compute',
        message: e.message
      });
    }
  );
});

export = router;
