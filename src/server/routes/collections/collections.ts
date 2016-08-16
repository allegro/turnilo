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
import { AppSettings, Collection, CollectionJS } from '../../../common/models/index';
import { MANIFESTS } from '../../../common/manifests/index';

import { PivotRequest } from '../../utils/index';
import { VERSION, SETTINGS_MANAGER } from '../../config';

var router = Router();

router.post('/', (req: PivotRequest, res: Response) => {
  var { version, collections } = req.body;

  if (version && version !== VERSION) {
    res.status(412).send({
      error: 'incorrect version',
      action: 'reload'
    });
    return;
  }

  if (!Array.isArray(collections)) {
    res.status(400).send({
      error: 'bad collections',
      message: 'not an array'
    });
    return;
  }

  SETTINGS_MANAGER.getSettings()
    .then((appSettings) => {
      var collectionContext = {
        dataCubes: appSettings.dataCubes,
        visualizations: MANIFESTS
      };

      return appSettings.changeCollections(collections.map((collection: CollectionJS) => {
        return Collection.fromJS(collection, collectionContext);
      }));
    })
    .then((newAppSettings) => SETTINGS_MANAGER.updateSettings(newAppSettings))
    .then(
      () => {
        res.send({ status: 'ok' });
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
    )
    .done();

});

export = router;
