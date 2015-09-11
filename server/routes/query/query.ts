'use strict';

import * as path from 'path';
import { readFileSync } from 'fs';
import { Router, Request, Response } from 'express';
import { $, Expression, External, Datum, Dataset, TimeRange, basicExecutorFactory, Executor, helper } from 'plywood';
import { druidRequesterFactory } from 'plywood-druid-requester';
import { Timezone, WallTime, Duration } from "chronoshift";

import { DRUID_HOST } from '../../config';

var router = Router();

var druidRequester = druidRequesterFactory({
  host: DRUID_HOST,
  timeout: 30000
});

//druidRequester = helper.verboseRequesterFactory({
//  requester: druidRequester
//});

function getWikiData(): any[] {
  var countries = ['USA', 'UK', 'Israel'];
  var cities = ['San Francisco', 'London', 'Tel Aviv', 'New York', 'Oxford', 'Kfar Saba'];
  try {
    var wikiData = JSON.parse(readFileSync(path.join(__dirname, '../../../data/wikipedia.json'), 'utf-8'));
    var secInHour = 60 * 60;
    wikiData.forEach((d: Datum, i: number) => {
      d['continent'] = 'Oceana';
      d['country'] = countries[i % countries.length];
      d['city'] = cities[i % cities.length];
      d['region'] = 'North';
      d['time'] = new Date(Date.parse(d['time']) + (i % secInHour) * 1000);
    });
    return wikiData;
  } catch (e) {
    return [];
  }
}

var wikiDataset = Dataset.fromJS(getWikiData()).hide();
var executors: Lookup<Executor> = {
  'static-wiki':  basicExecutorFactory({
    datasets: { main: wikiDataset }
  })
};

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
