/*
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

import { Response, Router } from "express";
import * as request from "request-promise-native";
import { definitionConverters, ViewDefinitionVersion } from "../../../common/view-definitions";
import { SERVER_SETTINGS } from "../../config";
import { SwivRequest } from "../../utils";
import { GetSettingsOptions } from "../../utils/settings-manager/settings-manager";

var router = Router();

router.post("/", (req: SwivRequest, res: Response) => {
  const { externalSystem } = SERVER_SETTINGS;

  const { dataCubeName, viewDefinitionVersion, viewDefinition } = req.body;

  if (typeof viewDefinitionVersion !== "string") {
    res.status(400).send({
      error: "must have a viewDefinitionVersion"
    });
    return;
  }

  const definitionConverter = definitionConverters[viewDefinitionVersion as ViewDefinitionVersion];

  if (definitionConverter == null) {
    res.status(400).send({
      error: "unsupported viewDefinitionVersion value"
    });
    return;
  }

  if (typeof dataCubeName !== "string") {
    res.status(400).send({
      error: "must have a dataCubeName"
    });
    return;
  }

  if (typeof viewDefinition !== "object") {
    res.status(400).send({
      error: "viewDefinition must be an object"
    });
    return;
  }

  req.getSettings(<GetSettingsOptions> { dataCubeOfInterest: dataCubeName })
    .then((appSettings: any) => {
      const myDataCube = appSettings.getDataCube(dataCubeName);
      const requestTimeout = Boolean(appSettings.customization.externalSystem.exportTimeout) ?
        appSettings.customization.externalSystem.exportTimeout : 1000;

      if (!myDataCube) {
        res.status(400).send({ error: "unknown data cube" });
        return;
      }
      request
        .post(externalSystem, { json: req.body, timeout: requestTimeout })
        .promise()
        .then(_ => res.status(204).end())
        .catch(reason => {
          const returnCode = Boolean(reason.statusCode) ? reason.statusCode : 500;
          res.status(returnCode).send({ message: reason.message });
        });
    });
});

export = router;
