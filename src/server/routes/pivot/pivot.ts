import { Router, Request, Response } from 'express';
import { Timezone, WallTime, Duration } from 'chronoshift';

import { PivotRequest } from '../../utils/index';
import { pivotLayout } from '../../views';

var router = Router();

router.get('/', (req: PivotRequest, res: Response, next: Function) => {
  req.getSettings()
    .then((appSettings) => {
      var clientSettings = appSettings.toClientSettings();
      res.send(pivotLayout({
        version: req.version,
        title: appSettings.customization.getTitle(req.version),
        user: req.user,
        appSettings: clientSettings,
        readOnly: false // ToDo: fix this
      }));
    })
    .done();
});

export = router;
