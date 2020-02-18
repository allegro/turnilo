/*
 * Copyright 2017-2018 Allegro.pl
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

import { $, Expression, r, SortExpression } from "plywood";
import { TimeShiftEnvType } from "../../../../common/models/time-shift/time-shift-env";
import { CANONICAL_LENGTH_ID } from "../../../../common/utils/canonical-length/query";
import timeFilterCanonicalLength from "../../../../common/utils/canonical-length/time-filter-canonical-length";
import { QueryParams } from "./query-params";

const TOP_N = 100;

export function makeQuery({ essence, timekeeper, dimension, sortOn, searchText }: QueryParams): Expression {
  const { dataCube } = essence;
  let filter = essence.getEffectiveFilter(timekeeper, { unfilterDimension: dimension });

  let filterExpression = filter.toExpression(dataCube);

  if (searchText) {
    filterExpression = filterExpression.and(dimension.expression.contains(r(searchText), "ignoreCase"));
  }

  let query: any = $("main")
    .filter(filterExpression)
    .split(dimension.expression, dimension.name);

  const sortExpression: Expression = $(sortOn.key);

  const sortSeries = essence.findConcreteSeries(sortOn.key);
  if (sortSeries) {
    query = query
      .apply(CANONICAL_LENGTH_ID, timeFilterCanonicalLength(essence, timekeeper))
      .performAction(sortSeries.plywoodExpression(0, { type: TimeShiftEnvType.CURRENT }));
  }

  return query.sort(sortExpression, SortExpression.DESCENDING).limit(TOP_N + 1);
}
