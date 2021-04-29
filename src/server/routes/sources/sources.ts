/*
 * Copyright 2017-2021 Allegro.pl
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
import { LOGGER } from "../../../common/logger/logger";
import { serialize } from "../../../common/models/sources/sources";
import { checkAccess } from "../../utils/datacube-guard/datacube-guard";
import { SourcesGetter } from "../../utils/settings-manager/settings-manager";

export function sourcesRouter(sourcesGetter: SourcesGetter) {

  const logger = LOGGER.addPrefix("Settings Endpoint: ");

  const router = Router();

  router.get("/", async (req: Request, res: Response) => {

    try {
      const { clusters, dataCubes } = await sourcesGetter();
      res.json(serialize({
        clusters,
        dataCubes: dataCubes.filter( dataCube => checkAccess(dataCube, req.headers) )
      }));
    } catch (error) {
      logger.error(error.message);
      if (error.hasOwnProperty("stack")) {
        logger.error(error.stack);
      }
      res.status(500).send({
        error: "Can't fetch settings",
        message: error.message
      });
    }
  });

  return router;
}
