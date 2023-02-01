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
import { getQueryDecorator } from "../../utils/query-decorator-loader/get-query-decorator";
import { executeQuery } from "../../utils/query/execute-query";
import { handleRequestErrors } from "../../utils/request-errors/handle-request-errors";
import { parseDataCube } from "../../utils/request-params/parse-data-cube";
import { parseExpression } from "../../utils/request-params/parse-expression";
import { parseTimezone } from "../../utils/request-params/parse-timezone";
import { SettingsManager } from "../../utils/settings-manager/settings-manager";

export function plywoodRouter(settingsManager: Pick<SettingsManager, "anchorPath" | "getSources" | "logger">) {
  const logger = settingsManager.logger;
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    try {

      const dataCube = await parseDataCube(req, settingsManager);
      const timezone = parseTimezone(req);
      const expression = parseExpression(req);

      const queryDecorator = getQueryDecorator(req, dataCube, settingsManager);
      const result = await executeQuery(dataCube, expression, timezone, queryDecorator);
      res.json({ result });

    } catch (error) {
      handleRequestErrors(error, res, logger);
    }
  });

  return router;
}
