/*
 * Copyright 2017-2022 Allegro.pl
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
import { Dataset } from "plywood";
import { deserialize } from "../../../client/deserializers/app-settings";
import makeGridQuery from "../../../client/visualizations/grid/make-query";
import { errorToMessage } from "../../../common/logger/logger";
import { AppSettings, ClientAppSettings, serialize } from "../../../common/models/app-settings/app-settings";
import { ClientDataCube } from "../../../common/models/data-cube/data-cube";
import { isQueryable, QueryableDataCube } from "../../../common/models/data-cube/queryable-data-cube";
import { Essence } from "../../../common/models/essence/essence";
import { getDataCube, Sources } from "../../../common/models/sources/sources";
import makeQuery from "../../../common/utils/query/visualization-query";
import { definitionConverters, ViewDefinitionVersion } from "../../../common/view-definitions";
import { checkAccess } from "../../utils/datacube-guard/datacube-guard";
import { loadQueryDecorator } from "../../utils/query-decorator-loader/load-query-decorator";
import { SettingsManager } from "../../utils/settings-manager/settings-manager";

function convertToClientAppSettings(appSettings: AppSettings): ClientAppSettings {
  return deserialize(serialize(appSettings));
}

function convertToClientDataCube(cube: QueryableDataCube): ClientDataCube {
  return {
    ...cube,
    timeAttribute: cube.timeAttribute && cube.timeAttribute.name
  };
}

export function queryRouter(settings: Pick<SettingsManager, "logger" | "getSources" | "appSettings" | "anchorPath" | "getTimekeeper">) {

  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    const { dataCube, viewDefinitionVersion, viewDefinition } = req.body;

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

    if (typeof dataCube !== "string") {
      res.status(400).send({ error: "must have a dataCubeName" });
      return;
    }

    if (typeof viewDefinition !== "object") {
      res.status(400).send({ error: "viewDefinition must be an object" });
      return;
    }

    let sources: Sources;
    try {
      sources = await settings.getSources();
    } catch (e) {
      res.status(400).send({ error: "Couldn't load settings" });
      return;
    }
    const myDataCube = getDataCube(sources, dataCube);
    if (!myDataCube) {
      res.status(400).send({ error: "unknown data cube" });
      return;
    }

    if (!isQueryable(myDataCube)) {
      res.status(400).send({ error: "un queryable data cube" });
      return;
    }

    if (!(checkAccess(myDataCube, req.headers))) {
      res.status(403).send({ error: "access denied" });
      return;
    }

    const clientDataCube = convertToClientDataCube(myDataCube);
    const clientAppSettings = convertToClientAppSettings(settings.appSettings);

    let essence: Essence;
    try {
      essence = definitionConverter.fromViewDefinition(viewDefinition, clientAppSettings, clientDataCube);
    } catch ({ message }) {
      res.status(400).send({ error: "invalid viewDefinition object", message });
      return;
    }

    const maxQueries = myDataCube.maxQueries;
    const decorator = loadQueryDecorator(myDataCube, settings.anchorPath, settings.logger);

    const timekeeper = settings.getTimekeeper();

    const query = essence.visualization.name === "grid" ? makeGridQuery(essence, timekeeper) : makeQuery(essence, timekeeper);

    const expression = decorator(query, req);

    try {
      const data = await myDataCube.executor(expression, { maxQueries, timezone: viewDefinition.timezone });
      const reply = {
        result: Dataset.isDataset(data) ? data.toJS() : data
      };
      res.json(reply);
    } catch (error) {
      settings.logger.error(errorToMessage(error));

      res.status(500).send({
        error: "could not compute",
        message: error.message
      });
    }
  });

  return router;
}
