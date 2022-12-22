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
import { serialize as serializeDataCube } from "../../../common/models/data-cube/data-cube";
import { isQueryable } from "../../../common/models/data-cube/queryable-data-cube";
import { checkAccess } from "../../utils/datacube-guard/datacube-guard";
import { SettingsManager } from "../../utils/settings-manager/settings-manager";

export function sourcesRouter(settings: Pick<SettingsManager, "getSources" | "logger">) {

    const logger = settings.logger.setLoggerId("Sources");

    const router = Router();
    const MAX_DATA_CUBES_IN_REQUEST = 1000;
    router.get("/clusters", async (req: Request, res: Response) => {
        try {
            const { clusters } = await settings.getSources();
            res.json(clusters.map(serializeCluster));
        } catch (error) {
            logger.error(errorToMessage(error));

            res.status(500).send({
                error: "Can't fetch settings",
                message: error.message
            });
        }
    });
    router.get("/dataCubes", async (req: Request, res: Response) => {
        try {
            const { dataCubes } = await settings.getSources();
            const relevantDatasources = dataCubes.filter(dataCube => checkAccess(dataCube, req.headers))
                .filter(dc => isQueryable(dc))
                .map(serializeDataCube);
            if (relevantDatasources.length < MAX_DATA_CUBES_IN_REQUEST) {
                res.json({ dataCubes: relevantDatasources, isDone: true });
            } else {
                const currentBatchNumber = (req.query["batch"] && parseInt(req.query["batch"] as string, 10)) || 0;
                const dataSourcesStart = currentBatchNumber * MAX_DATA_CUBES_IN_REQUEST;
                const dataSourcesEnd = dataSourcesStart + MAX_DATA_CUBES_IN_REQUEST;
                const isDone = dataSourcesEnd >= dataCubes.length;
                res.json({
                    dataCubes: relevantDatasources.slice(dataSourcesStart, dataSourcesEnd),
                    isDone
                });
            }
        } catch (error) {
            logger.error(errorToMessage(error));
            res.status(500).send({
                error: "Can't fetch settings",
                message: error.message
            });
        }
    });

    return router;
}
