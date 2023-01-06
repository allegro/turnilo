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
import { errorToMessage } from "../../../common/logger/logger";
import { serialize as serializeCluster } from "../../../common/models/cluster/cluster";
import { SerializedDataCube } from "../../../common/models/data-cube/data-cube";
import { serializeDataCubes } from "../../../common/models/sources/sources";
import { checkAccess } from "../../utils/datacube-guard/datacube-guard";
import { SettingsManager } from "../../utils/settings-manager/settings-manager";

const PAGE_SIZE = 10;

interface DataCubesSlice {
  dataCubes: SerializedDataCube[];
  next?: number;
}

function getDataCubesPage(dataCubes: SerializedDataCube[], page: number): DataCubesSlice {
  const sliceStart = page * PAGE_SIZE;
  const sliceEnd = sliceStart + PAGE_SIZE;
  const next = sliceEnd < dataCubes.length ? page + 1 : undefined;
  return {
    dataCubes: dataCubes.slice(sliceStart, sliceEnd),
    next
  };
}

function getPageNumber(page: unknown): number {
  if (typeof page === "string") return parseInt(page, 10);
  return 0;
}

export function sourcesRouter(settings: Pick<SettingsManager, "getSources" | "logger">) {

  const logger = settings.logger.setLoggerId("Sources");

  const router = Router();
  router.get("/clusters", async (req: Request, res: Response) => {
    try {
      const { clusters } = await settings.getSources();
      res.json(clusters.map(serializeCluster));
    } catch (error) {
      logger.error(errorToMessage(error));
      res.status(500).send({
        error: "Can't fetch clusters",
        message: error.message
      });
    }
  });

  router.get("/dataCubes", async (req: Request, res: Response) => {
    try {
      const sources = await settings.getSources();
      const dataCubes = sources.dataCubes
        .filter(dataCube => checkAccess(dataCube, req.headers));
      const serializedDataCubes = serializeDataCubes(dataCubes);
      const page = getPageNumber(req.query.page);
      res.json(getDataCubesPage(serializedDataCubes, page));
    } catch (error) {
      logger.error(errorToMessage(error));
      res.status(500).send({
        error: "Can't fetch data cubes",
        message: error.message
      });
    }
  });

  return router;
}
