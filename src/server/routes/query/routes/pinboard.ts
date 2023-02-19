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
import { $, Expression } from "plywood";
import { findDimensionByName } from "../../../../common/models/dimension/dimensions";
import { Essence } from "../../../../common/models/essence/essence";
import { StringFilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Split } from "../../../../common/models/split/split";
import { TimeShiftEnvType } from "../../../../common/models/time-shift/time-shift-env";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { CANONICAL_LENGTH_ID } from "../../../../common/utils/canonical-length/query";
import timeFilterCanonicalLength from "../../../../common/utils/canonical-length/time-filter-canonical-length";
import { isNil } from "../../../../common/utils/general/general";
import { executeQuery } from "../../../utils/query/execute-query";
import { parseOptionalStringFilterClause } from "../../../utils/request-params/parse-filter-clause";
import { parseSplit } from "../../../utils/request-params/parse-split";
import { QueryRouterRequest } from "../query";

function getQuery(essence: Essence, clause: StringFilterClause | null, split: Split, timekeeper: Timekeeper): Expression {
  const { dataCube } = essence;

  const dimension = findDimensionByName(dataCube.dimensions, split.reference);
  const sortSeries = essence.findConcreteSeries(split.sort.reference);
  const canonicalLength = timeFilterCanonicalLength(essence, timekeeper);

  const filter = essence
    .changeFilter(isNil(clause) ? essence.filter.removeClause(split.reference) : essence.filter.setClause(clause))
    .getEffectiveFilter(timekeeper)
    .toExpression(dataCube);

  return $("main")
    .filter(filter)
    .split(dimension.expression, dimension.name)
    .apply(CANONICAL_LENGTH_ID, canonicalLength)
    .performAction(sortSeries.plywoodExpression(0, { type: TimeShiftEnvType.CURRENT }))
    .performAction(split.sort.toExpression())
    .limit(split.limit);
}

export default async function pinboardRoute(req: QueryRouterRequest, res: Response) {
  const { dataCube, essence, decorator, timekeeper } = req.context;
  const clause = parseOptionalStringFilterClause(req, dataCube);
  const split = parseSplit(req, dataCube);
  const query = getQuery(essence, clause, split, timekeeper);
  const result = await executeQuery(dataCube, query, essence.timezone, decorator);
  res.json({ result });
}
