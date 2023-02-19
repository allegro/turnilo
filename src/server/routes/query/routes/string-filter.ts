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
import { $, Expression, SortExpression } from "plywood";
import { findDimensionByName } from "../../../../common/models/dimension/dimensions";
import { Essence } from "../../../../common/models/essence/essence";
import { StringFilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { executeQuery } from "../../../utils/query/execute-query";
import { parseStringFilterClause } from "../../../utils/request-params/parse-filter-clause";
import { QueryRouterRequest } from "../query";

// TODO: expose for UI
const TOP_N = 100;

function getQuery(essence: Essence, clause: StringFilterClause, timekeeper: Timekeeper): Expression {
  const { dataCube } = essence;
  const { reference: dimensionName } = clause;

  const $main = $("main");
  const dimension = findDimensionByName(dataCube.dimensions, dimensionName);
  const nativeCount = findDimensionByName(dataCube.dimensions, "count");
  const measureExpression = nativeCount ? nativeCount.expression : $main.count();

  const filter = essence
    .changeFilter(essence.filter.setClause(clause))
    .getEffectiveFilter(timekeeper).toExpression(dataCube);

  return $main
    .filter(filter)
    .split(dimension.expression, dimension.name)
    .apply("MEASURE", measureExpression)
    .sort($("MEASURE"), SortExpression.DESCENDING)
    .limit(TOP_N);
}

export default async function stringFilterRoute(req: QueryRouterRequest, res: Response) {
  const { dataCube, essence, decorator, timekeeper } = req.context;
  const clause = parseStringFilterClause(req, dataCube);
  const query = getQuery(essence, clause, timekeeper);
  const result = await executeQuery(dataCube, query, essence.timezone, decorator);
  res.json({ result });
}
