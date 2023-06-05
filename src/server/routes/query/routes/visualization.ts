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

import { Response } from "express";
import { Expression } from "plywood";
import makeGridQuery from "../../../../client/visualizations/grid/make-query";
import { Essence } from "../../../../common/models/essence/essence";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import makeQuery from "../../../../common/utils/query/visualization-query";
import { executeQuery } from "../../../utils/query/execute-query";
import { logQueryInfo } from "../../../utils/query/log-query";
import { QueryRouterRequest } from "../query";

function getQuery(essence: Essence, timekeeper: Timekeeper): Expression {
  return essence.visualization.name === "grid" ? makeGridQuery(essence, timekeeper) : makeQuery(essence, timekeeper);
}

export default async function visualizationRoute({ turniloMetadata, context }: QueryRouterRequest, res: Response) {
  const { dataCube, essence, decorator, timekeeper, logger } = context;
  const query = getQuery(essence, timekeeper);
  const queryTimeStart = Date.now();
  const result = await executeQuery(dataCube, query, essence.timezone, decorator);
  logQueryInfo(essence, timekeeper, logger.setLoggerId("turnilo-visualization-query"), Date.now() - queryTimeStart, turniloMetadata.loggerContext);
  res.json({ result });
}
