import { Router, Request, Response } from 'express';
import { $, Expression, RefExpression, External, Datum, Dataset, TimeRange, basicExecutorFactory, Executor, AttributeJSs, helper } from 'plywood';
import { Timezone, WallTime, Duration } from 'chronoshift';

import { PivotRequest } from '../../utils/index';
import { VERSION } from '../../config';
import { DataSource } from '../../../common/models/index';

var router = Router();

router.post('/', (req: PivotRequest, res: Response) => {
  var { version, dataSource, expression } = req.body;

  if (version !== VERSION) {
    res.status(400).send({
      error: 'incorrect version',
      action: 'reload'
    });
    return;
  }

  if (typeof dataSource !== 'string') {
    res.status(400).send({
      error: 'must have a dataSource'
    });
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

  req.dataSourceManager.getQueryableDataSource(dataSource)
    .then((myDataSource) => {
      if (!myDataSource) {
        res.status(400).send({ error: 'unknown data source' });
        return;
      }

      return myDataSource.executor(ex).then(
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
    })
    .done();

});

export = router;
