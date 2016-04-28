import { Router, Request, Response } from 'express';
import { Timezone, WallTime, Duration } from 'chronoshift';

import { PivotRequest } from '../../utils/index';
import { CUSTOMIZATION, VERSION, LINK_VIEW_CONFIG } from '../../config';
import { pivotLayout } from '../../views';

var router = Router();

router.get('/', (req: PivotRequest, res: Response, next: Function) => {
  var title = (CUSTOMIZATION && CUSTOMIZATION.title) ? CUSTOMIZATION.title : 'Pivot (%v)';
  req.dataSourceManager.getQueryableDataSources()
    .then((dataSources) => {
      res.send(pivotLayout({
        version: VERSION,
        title: title.replace(/%v/g, VERSION),
        config: {
          version: VERSION,
          user: req.user,
          dataSources: dataSources.map((ds) => ds.toClientDataSource()),
          linkViewConfig: LINK_VIEW_CONFIG,
          customization: CUSTOMIZATION
        }
      }));
    })
    .done();
});

export = router;
