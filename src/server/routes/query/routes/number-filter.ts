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
import { $, Expression, ply } from "plywood";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { executeQuery } from "../../../utils/query/execute-query";
import { parseDimension } from "../../../utils/request-params/parse-dimension";
import { QueryRouterRequest } from "../query";

function getQuery(essence: Essence, dimension: Dimension, timekeeper: Timekeeper): Expression {
  const { dataCube } = essence;
  const filterExpression = essence
    .getEffectiveFilter(timekeeper, { unfilterDimension: dimension })
    .toExpression(dataCube);
  const $main = $("main");
  return ply()
    .apply("main", $main.filter(filterExpression))
    .apply("Min", $main.min($(dimension.name)))
    .apply("Max", $main.max($(dimension.name)));
}

export default async function numberFilterRoute(req: QueryRouterRequest, res: Response) {
  const { dataCube, essence, decorator, timekeeper } = req.context;
  const dimension = parseDimension(req, dataCube);
  const query = getQuery(essence, dimension, timekeeper);
  const result = await executeQuery(dataCube, query, essence.timezone, decorator);
  res.json({ result });
}
