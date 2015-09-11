'use strict';

import * as path from 'path';
import { readFileSync } from 'fs';
import { Router, Request, Response } from 'express';
import { $, Expression, External, Datum, Dataset, TimeRange, basicExecutorFactory, Executor, AttributeJSs, helper } from 'plywood';
import { druidRequesterFactory } from 'plywood-druid-requester';
import { Timezone, WallTime, Duration } from "chronoshift";

import { DRUID_HOST, DATA_SOURCES } from '../../config';

var router = Router();

var druidRequester = druidRequesterFactory({
  host: DRUID_HOST,
  timeout: 30000
});

//druidRequester = helper.verboseRequesterFactory({
//  requester: druidRequester
//});

function getWikiData(): any[] {
  var countries = ['Santo Marco', 'Arstotzka', 'Buranda'];
  var cities = ['Gotham City', 'Metropolis', 'Cabot Cove', 'Sunnydale', 'Quahog', 'Castle Rock'];
  try {
    var wikiData = JSON.parse(readFileSync(path.join(__dirname, '../../../data/wikipedia.json'), 'utf-8'));
    var secInHour = 60 * 60;
    wikiData.forEach((d: Datum, i: number) => {
      d['country'] = countries[i % countries.length];
      d['city'] = cities[i % cities.length];
      d['time'] = new Date(Date.parse(d['time']) + (103 * i % secInHour) * 1000);
    });
    return wikiData;
  } catch (e) {
    return [];
  }
}

function makeExternal(dataSource: any): External {
  var attributes: AttributeJSs = {};

  // Right here we have the classic mega hack.
  for (var dimension of dataSource.dimensions) {
    attributes[dimension.name] = { type: dimension.type || 'STRING' };
  }

  for (var measure of dataSource.measures) {
    var expression = measure.expression ? Expression.fromJSLoose(measure.expression) : $(measure.name);
    var freeReferences = expression.getFreeReferences();
    for (var freeReference of freeReferences) {
      if (freeReference === 'main') continue;
      if (JSON.stringify(expression).indexOf('countDistinct') !== -1) {
        attributes[freeReference] = { special: 'unique' };
      } else {
        attributes[freeReference] = { type: 'NUMBER' };
      }
    }
  }
  // Mega hack ends here

  return External.fromJS({
    engine: 'druid',
    dataSource: dataSource.source,
    timeAttribute: dataSource.timeAttribute,
    context: null,
    attributes,
    requester: druidRequester
  });
}

var executors: Lookup<Executor> = {};

for (var dataSource of DATA_SOURCES) {
  if (dataSource.source) {
    executors[dataSource.name] = basicExecutorFactory({
      datasets: { main: makeExternal(dataSource) }
    });
  } else {
    var wikiDataset = Dataset.fromJS(getWikiData()).hide();
    executors[dataSource.name] = basicExecutorFactory({
      datasets: { main: wikiDataset }
    });
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
      res.status(500).send({
        error: 'could not compute',
        message: e.message
      });
    }
  );
});

export = router;
