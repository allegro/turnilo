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
import { $, Expression } from "plywood";
import makeGridQuery from "../../../client/visualizations/grid/make-query";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { LIMIT } from "../../../common/models/raw-data-modal/raw-data-modal";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import makeQuery from "../../../common/utils/query/visualization-query";
import { createEssence } from "../../utils/essence/create-essence";
import { getQueryDecorator } from "../../utils/query-decorator-loader/get-query-decorator";
import { executeQuery } from "../../utils/query/execute-query";
import { handleRequestErrors } from "../../utils/request-errors/handle-request-errors";
import { parseDataCube } from "../../utils/request-params/parse-data-cube";
import { parseDimension } from "../../utils/request-params/parse-dimension";
import { parseViewDefinition } from "../../utils/request-params/parse-view-definition";
import { parseViewDefinitionConverter } from "../../utils/request-params/parse-view-definition-converter";
import { SettingsManager } from "../../utils/settings-manager/settings-manager";

export function queryRouter(settings: Pick<SettingsManager, "logger" | "getSources" | "appSettings" | "anchorPath" | "getTimekeeper">) {

  const router = Router();

  router.post("/visualization", async (req: Request, res: Response) => {

    function getQuery(essence: Essence, timekeeper: Timekeeper): Expression {
      return essence.visualization.name === "grid" ? makeGridQuery(essence, timekeeper) : makeQuery(essence, timekeeper);
    }

    try {
      const dataCube = await parseDataCube(req, settings);
      const viewDefinition = parseViewDefinition(req);
      const converter = parseViewDefinitionConverter(req);

      const essence = createEssence(viewDefinition, converter, dataCube, settings.appSettings);

      const query = getQuery(essence, settings.getTimekeeper());
      const queryDecorator = getQueryDecorator(req, dataCube, settings);
      const result = await executeQuery(dataCube, query, essence.timezone, queryDecorator);
      res.json({ result });

    } catch (error) {
      handleRequestErrors(error, res, settings.logger);
    }
  });

  router.post("/raw-data", async (req: Request, res: Response) => {
    function getQuery(essence: Essence, timekeeper: Timekeeper): Expression {
      const { dataCube } = essence;
      const $main = $("main");
      const filterExpression = essence
        .getEffectiveFilter(timekeeper)
        .toExpression(dataCube);
      return $main.filter(filterExpression).limit(LIMIT);
    }

    try {
      const dataCube = await parseDataCube(req, settings);
      const viewDefinition = parseViewDefinition(req);
      const converter = parseViewDefinitionConverter(req);

      const essence = createEssence(viewDefinition, converter, dataCube, settings.appSettings);

      const query = getQuery(essence, settings.getTimekeeper());
      const queryDecorator = getQueryDecorator(req, dataCube, settings);
      const result = await executeQuery(dataCube, query, essence.timezone, queryDecorator);
      res.json({ result });
    } catch (error) {
      handleRequestErrors(error, res, settings.logger);
    }
  });

  router.post("/boolean-filter", async (req: Request, res: Response) => {
    function getQuery(essence: Essence, dimension: Dimension, timekeeper: Timekeeper): Expression {
      const { dataCube } = essence;
      const filterExpression = essence
        .getEffectiveFilter(timekeeper, { unfilterDimension: dimension })
        .toExpression(dataCube);

      return $("main")
        .filter(filterExpression)
        .split(dimension.expression, dimension.name);
    }

    try {
      const dataCube = await parseDataCube(req, settings);
      const viewDefinition = parseViewDefinition(req);
      const converter = parseViewDefinitionConverter(req);
      const dimension = parseDimension(req, dataCube);

      const essence = createEssence(viewDefinition, converter, dataCube, settings.appSettings);

      const query = getQuery(essence, dimension, settings.getTimekeeper());
      const queryDecorator = getQueryDecorator(req, dataCube, settings);
      const result = await executeQuery(dataCube, query, essence.timezone, queryDecorator);
      res.json({ result });

    } catch (error) {
      handleRequestErrors(error, res, settings.logger);
    }
  });
  return router;
}
