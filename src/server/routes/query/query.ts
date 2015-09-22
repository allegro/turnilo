'use strict';

import { Router, Request, Response } from 'express';
import { $, Expression, RefExpression, External, Datum, Dataset, TimeRange, basicExecutorFactory, Executor, AttributeJSs, helper } from 'plywood';
import { druidRequesterFactory } from 'plywood-druid-requester';
import { Timezone, WallTime, Duration } from 'chronoshift';

import { DRUID_HOST, DATA_SOURCES } from '../../config';
import { makeExecutorsFromDataSources } from '../../utils/index';

var router = Router();

var druidRequester = druidRequesterFactory({
  host: DRUID_HOST,
  timeout: 30000
});

//druidRequester = helper.verboseRequesterFactory({
//  requester: druidRequester
//});

try {
  var executors = makeExecutorsFromDataSources(DATA_SOURCES, druidRequester);
} catch (e) {
  console.error(e.message);
  process.exit(1);
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
