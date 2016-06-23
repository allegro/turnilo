import { Router, Request, Response } from 'express';
import { Timezone, WallTime, Duration } from 'chronoshift';
import { Essence } from '../../../common/models/index';
import { MANIFESTS } from '../../../common/manifests';
import { PivotRequest } from '../../utils/index';

var router = Router();

router.post('/', (req: PivotRequest, res: Response) => {
  var { domain, dataSource, essence } = req.body;

  if (typeof domain !== 'string') {
    res.status(400).send({
      error: 'must have a domain'
    });
    return;
  }

  if (typeof dataSource !== 'string') {
    res.status(400).send({
      error: 'must have a dataSource'
    });
    return;
  }

  if (typeof essence !== 'object') {
    res.status(400).send({
      error: 'essence must be an object'
    });
    return;
  }

  req.getSettings(dataSource)
    .then((appSettings) => {
      var myDataSource = appSettings.getDataSource(dataSource);
      if (!myDataSource) {
        res.status(400).send({ error: 'unknown data source' });
        return;
      }

      try {
        var essenceObj = Essence.fromJS(essence, {
          dataSource: myDataSource,
          visualizations: MANIFESTS
        });
      } catch (e) {
        res.status(400).send({
          error: 'invalid essence',
          message: e.message
        });
        return;
      }

      res.json({
        url: essenceObj.getURL(`${domain}#${myDataSource.name}/`)
      });
    })
    .done();

});

export = router;
