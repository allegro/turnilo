'use strict';

import * as path from 'path';
import { readFileSync } from 'fs';
import { $, Expression, RefExpression, External, Datum, Dataset, TimeRange, basicExecutorFactory, Executor, AttributeJSs, helper } from 'plywood';
import { DataSource } from '../../../common/models/index';


function getReferences(ex: Expression): string[] {
  var references: string[] = [];
  ex.forEach((ex: Expression) => {
    if (ex instanceof RefExpression) {
      references.push(ex.name);
    }
  });
  return references;
}

export function getFileData(filePath: string): any[] {
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

export function makeExternal(dataSource: DataSource, druidRequester: Requester.PlywoodRequester<any>): External {
  var attributes: AttributeJSs = {};

  // Right here we have the classic mega hack.
  dataSource.dimensions.forEach((dimension) => {
    attributes[dimension.name] = { type: dimension.type };
  });

  dataSource.measures.forEach((measure) => {
    var expression = measure.expression;
    var references = getReferences(expression);
    for (var reference of references) {
      if (reference === 'main') continue;
      if (JSON.stringify(expression).indexOf('countDistinct') !== -1) {
        attributes[reference] = { special: 'unique' };
      } else {
        attributes[reference] = { type: 'NUMBER' };
      }
    }
  });
  // Mega hack ends here

  return External.fromJS({
    engine: 'druid',
    dataSource: dataSource.source,
    timeAttribute: dataSource.timeAttribute.name,
    customAggregations: dataSource.options['customAggregations'],
    context: null,
    attributes,
    requester: druidRequester
  });
}

export function makeExecutorsFromDataSources(dataSources: DataSource[], druidRequester: Requester.PlywoodRequester<any>): Lookup<Executor> {
  var executors: Lookup<Executor> = Object.create(null);

  for (var dataSource of dataSources) {
    switch (dataSource.engine) {
      case 'native':
        var filePath = path.join(__dirname, '../../../../', dataSource.source);
        executors[dataSource.name] = basicExecutorFactory({
          datasets: { main: Dataset.fromJS(getFileData(filePath)).hide() }
        });
        break;

      case 'druid':
        executors[dataSource.name] = basicExecutorFactory({
          datasets: { main: makeExternal(dataSource, druidRequester) }
        });
        break;

      default:
        throw new Error(`Invalid engine: '${dataSource.engine}' in '${dataSource.name}'`);
    }
  }

  return executors;
}
