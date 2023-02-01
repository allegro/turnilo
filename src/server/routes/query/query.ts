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
import { Expression } from "plywood";
import makeGridQuery from "../../../client/visualizations/grid/make-query";
import { errorToMessage } from "../../../common/logger/logger";
import { Essence } from "../../../common/models/essence/essence";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import makeQuery from "../../../common/utils/query/visualization-query";
import { executeQuery } from "../../utils/query/execute-query";
import { SettingsManager } from "../../utils/settings-manager/settings-manager";
import {
  createEssence,
  isValidationError,
  parseDataCube,
  parseViewDefinition,
  parseViewDefinitionConverter
} from "../../utils/validation/validators";

function getQuery(essence: Essence, timekeeper: Timekeeper): Expression {
  return essence.visualization.name === "grid" ? makeGridQuery(essence, timekeeper) : makeQuery(essence, timekeeper);
}

export function queryRouter(settings: Pick<SettingsManager, "logger" | "getSources" | "appSettings" | "anchorPath" | "getTimekeeper">) {

  const router = Router();

  router.post("/", async (req: Request, res: Response) => {

    try {
      const dataCube = await parseDataCube(req, settings);
      const viewDefinition = parseViewDefinition(req);
      const converter = parseViewDefinitionConverter(req);

      const essence = createEssence(viewDefinition, converter, dataCube, settings.appSettings);
      const query = getQuery(essence, settings.getTimekeeper());
      const result = await executeQuery(req, dataCube, query, essence.timezone, settings);
      res.json({ result });

    } catch (error) {
      if (isValidationError(error)) {
        res.status(error.code).send({ error: error.message });
        return;
      }

      settings.logger.error(errorToMessage(error));

      res.status(500).send({
        error: "could not compute",
        message: error.message
      });
    }

  });

  return router;
}
