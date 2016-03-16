import { Router, Request, Response } from 'express';
import { $, Expression, RefExpression, External, Datum, Dataset, TimeRange, basicExecutorFactory, Executor, AttributeJSs, helper } from 'plywood';
import { Timezone, WallTime, Duration } from 'chronoshift';

import { PivotRequest } from '../../utils/index';
import { VERSION, LINK_VIEW_CONFIG } from '../../config';
import { DataSource } from '../../../common/models/index';
import { pivotLayout, noDataSourcesLayout } from '../../views';

var router = Router();

router.get('/', (req: PivotRequest, res: Response, next: Function) => {
  req.dataSourceManager.getQueryableDataSources()
    .then((dataSources) => {
      if (dataSources.length) {
        res.send(pivotLayout({
          version: VERSION,
          title: `Pivot (${VERSION})`,
          config: {
            version: VERSION,
            user: req.user,
            dataSources: dataSources.map((ds) => ds.toClientDataSource()),
            linkViewConfig: LINK_VIEW_CONFIG
          }
        }));
      } else {
        res.send(noDataSourcesLayout({
          version: VERSION,
          title: 'No Data Sources'
        }));
      }
    })
    .done();
});

export = router;
