/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Router, Request, Response } from 'express';
import { Timezone, WallTime, Duration } from 'chronoshift';
import { Essence } from '../../../common/models/index';
import { MANIFESTS } from '../../../common/manifests';
import { PivotRequest } from '../../utils/index';

var router = Router();

router.post('/', (req: PivotRequest, res: Response) => {
  var { domain, dataCube, dataSource, essence } = req.body;
  dataCube = dataCube || dataSource; // back compat

  if (typeof domain !== 'string') {
    res.status(400).send({
      error: 'must have a domain'
    });
    return;
  }

  if (typeof dataCube !== 'string') {
    res.status(400).send({
      error: 'must have a dataCube'
    });
    return;
  }

  if (typeof essence !== 'object') {
    res.status(400).send({
      error: 'essence must be an object'
    });
    return;
  }

  req.getSettings(dataCube)
    .then((appSettings) => {
      var myDataCube = appSettings.getDataCube(dataCube);
      if (!myDataCube) {
        res.status(400).send({ error: 'unknown data cube' });
        return;
      }

      try {
        var essenceObj = Essence.fromJS(essence, {
          dataCube: myDataCube,
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
        url: essenceObj.getURL(`${domain}#${myDataCube.name}/`)
      });
    })
    .done();

});

export = router;
