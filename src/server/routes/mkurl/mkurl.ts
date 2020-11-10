/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { Request, Response, Router } from "express";
import { AppSettings } from "../../../common/models/app-settings/app-settings";
import { Essence } from "../../../common/models/essence/essence";
import { urlHashConverter } from "../../../common/utils/url-hash-converter/url-hash-converter";
import { definitionConverters, ViewDefinitionVersion } from "../../../common/view-definitions";
import { MANIFESTS } from "../../../common/visualization-manifests";
import { GetSettingsOptions, SettingsGetter } from "../../utils/settings-manager/settings-manager";

export function mkurlRouter(settingsGetter: SettingsGetter) {

  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    const { dataCubeName, viewDefinitionVersion, viewDefinition } = req.body;

    if (typeof viewDefinitionVersion !== "string") {
      res.status(400).send({ error: "must have a viewDefinitionVersion" });
      return;
    }

    const definitionConverter = definitionConverters[viewDefinitionVersion as ViewDefinitionVersion];

    if (definitionConverter == null) {
      res.status(400).send({ error: "unsupported viewDefinitionVersion value"
      });
      return;
    }

    if (typeof dataCubeName !== "string") {
      res.status(400).send({ error: "must have a dataCubeName" });
      return;
    }

    if (typeof viewDefinition !== "object") {
      res.status(400).send({ error: "viewDefinition must be an object" });
      return;
    }

    let settings: AppSettings;
    try {
      settings = await settingsGetter();
    } catch (e) {
      res.status(400).send({ error: "Couldn't load settings" });
      return;
    }
    const myDataCube = settings.getDataCube(dataCubeName);
    if (!myDataCube) {
      res.status(400).send({ error: "unknown data cube" });
      return;
    }

    let essence: Essence;

    try {
      essence = definitionConverter.fromViewDefinition(viewDefinition, myDataCube);
    } catch ({ message }) {
      res.status(400).send({ error: "invalid viewDefinition object", message });
      return;
    }

    res.json({
      hash: `#${myDataCube.name}/${urlHashConverter.toHash(essence)}`
    });
  });
  return router;
}
