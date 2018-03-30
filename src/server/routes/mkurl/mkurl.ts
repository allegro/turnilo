/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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
import { Essence } from '../../../common/models/index';
import { MANIFESTS } from '../../../common/manifests';
import { UrlHashConverter } from "../../../common/utils/url-hash-converter/url-hash-converter";
import { definitionConverters, ViewDefinitionVersion } from "../../../common/view-definitions";
import { SwivRequest } from '../../utils/index';
import { GetSettingsOptions } from '../../utils/settings-manager/settings-manager';

var router = Router();

router.post('/', (req: SwivRequest, res: Response) => {
  var { domain, dataCube, dataSource, version, viewDefinition } = req.body;
  dataCube = dataCube || dataSource; // back compat

  if (typeof version !== 'string') {
    res.status(400).send({
      error: 'must have a version'
    });
    return;
  }

  const definitionConverter = definitionConverters[version as ViewDefinitionVersion];

  if (definitionConverter == null) {
    res.status(400).send({
      error: 'unsupported version value'
    });
    return;
  }

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

  if (typeof viewDefinition !== 'object') {
    res.status(400).send({
      error: 'viewDefinition must be an object'
    });
    return;
  }

  req.getSettings(<GetSettingsOptions>{ dataCubeOfInterest: dataCube })
    .then((appSettings: any) => {
      var myDataCube = appSettings.getDataCube(dataCube);
      if (!myDataCube) {
        res.status(400).send({ error: 'unknown data cube' });
        return;
      }

      let essence: Essence;

      try {
        essence = definitionConverter.fromViewDefinition(viewDefinition, myDataCube, MANIFESTS);
      } catch (e) {
        res.status(400).send({
          error: 'invalid viewDefinition object',
          message: e.message
        });
        return;
      }

      const urlHashConverter = new UrlHashConverter();
      res.json({
        url: `${domain}#${myDataCube.name}/${urlHashConverter.toHash(essence)}`
      });
    })
    .done();

});

export = router;
