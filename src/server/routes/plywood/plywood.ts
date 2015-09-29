'use strict';

import { Router, Request, Response } from 'express';
import { $, Expression, RefExpression, External, Datum, Dataset, TimeRange, basicExecutorFactory, Executor, AttributeJSs, helper } from 'plywood';
import { Timezone, WallTime, Duration } from 'chronoshift';

import { DATA_SOURCE_MANAGER } from '../../config';
import { DataSource } from '../../../common/models/index';

var router = Router();

router.post('/', (req: Request, res: Response) => {
  var { dataset, expression } = req.body;

  if (typeof dataset !== 'string') {
    res.status(400).send({ error: 'must have a string dataset' });
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

  DATA_SOURCE_MANAGER.getQueryableDataSource(dataset).then((myDataSource) => {
    if (!myDataSource) {
      res.status(400).send({ error: 'unknown dataset' });
      return;
    }

    myDataSource.executor(ex).then(
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
  }).done();

});

export = router;
