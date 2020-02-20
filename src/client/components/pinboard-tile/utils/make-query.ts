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
import { SortOn } from "../../../../common/models/sort-on/sort-on";
import { TimeShiftEnvType } from "../../../../common/models/time-shift/time-shift-env";
import { CANONICAL_LENGTH_ID } from "../../../../common/utils/canonical-length/query";
import timeFilterCanonicalLength from "../../../../common/utils/canonical-length/time-filter-canonical-length";
import { thread } from "../../../../common/utils/functional/functional";
import { QueryParams } from "./query-params";

const TOP_N = 100;

function filterExpression({ essence, searchText, timekeeper, dimension }: QueryParams): Expression {
  const expression = essence
    .getEffectiveFilter(timekeeper, { unfilterDimension: dimension })
    .toExpression(essence.dataCube);
  if (!searchText) return expression;
  return expression.and(dimension.expression.contains(r(searchText), "ignoreCase"));
}

function insertSortReferenceExpression({ essence, sortOn, timekeeper }: QueryParams) {
  const sortSeries = essence.findConcreteSeries(sortOn.key);
  return (query: Expression): Expression => {
    if (!sortSeries) return query;
    return query
      .apply(CANONICAL_LENGTH_ID, timeFilterCanonicalLength(essence, timekeeper))
      .performAction(sortSeries.plywoodExpression(0, { type: TimeShiftEnvType.CURRENT }));
  };
}

function applySort(sortOn: SortOn) {
  return (query: Expression) => query.sort($(sortOn.key), SortExpression.DESCENDING);
}

function limit(query: Expression): Expression {
  return query.limit(TOP_N + 1);
}

export function makeQuery(params: QueryParams): Expression {
  const { dimension, sortOn } = params;

  return thread(
    $("main")
      .filter(filterExpression(params))
      .split(dimension.expression, dimension.name),
    insertSortReferenceExpression(params),
    applySort(sortOn),
    limit
  );
}
