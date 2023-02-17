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

import { NextFunction, Request, Response, Router } from "express";
import { Logger } from "../../../common/logger/logger";
import { QueryableDataCube } from "../../../common/models/data-cube/queryable-data-cube";
import { Essence } from "../../../common/models/essence/essence";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { DEFAULT_VIEW_DEFINITION_VERSION, definitionConverters } from "../../../common/view-definitions";
import { createEssence } from "../../utils/essence/create-essence";
import { asyncHandler } from "../../utils/express/async-handler";
import { AppliedQueryDecorator, getQueryDecorator } from "../../utils/query-decorator-loader/get-query-decorator";
import { handleRequestErrors } from "../../utils/request-errors/handle-request-errors";
import { parseDataCube } from "../../utils/request-params/parse-data-cube";
import { parseViewDefinition } from "../../utils/request-params/parse-view-definition";
import { SettingsManager } from "../../utils/settings-manager/settings-manager";
import booleanFilterRoute from "./routes/boolean-filter";
import numberFilterRoute from "./routes/number-filter";
import pinboardRoute from "./routes/pinboard";
import rawDataRoute from "./routes/raw-data";
import stringFilterRoute from "./routes/string-filter";
import visualizationRoute from "./routes/visualization";

const converter = definitionConverters[DEFAULT_VIEW_DEFINITION_VERSION];

interface QueryRouterContext {
  dataCube: QueryableDataCube;
  essence: Essence;
  decorator: AppliedQueryDecorator;
  timekeeper: Timekeeper;
  logger: Logger;
}

export type QueryRouterRequest = Request & {
  context?: QueryRouterContext;
};

export function queryRouter(settings: Pick<SettingsManager, "logger" | "getSources" | "appSettings" | "anchorPath" | "getTimekeeper">) {
  const logger = settings.logger;

  const router = Router();

  router.use(asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const dataCube = await parseDataCube(req, settings);
    const viewDefinition = parseViewDefinition(req);
    const essence = createEssence(viewDefinition, converter, dataCube, settings.appSettings);
    const decorator = getQueryDecorator(req, dataCube, settings);

    (req as QueryRouterRequest).context = {
      logger,
      dataCube,
      essence,
      decorator,
      timekeeper: settings.getTimekeeper()
    };

    next();
  }));

  router.post("/visualization", asyncHandler(visualizationRoute));

  router.post("/raw-data", asyncHandler(rawDataRoute));

  router.post("/boolean-filter", asyncHandler(booleanFilterRoute));

  router.post("/string-filter", asyncHandler(stringFilterRoute));

  router.post("/number-filter", asyncHandler(numberFilterRoute));

  router.post("/pinboard", asyncHandler(pinboardRoute));

  router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    handleRequestErrors(error, res, logger);
  });

  return router;
}
