/*
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

import { $, Expression, r, SortExpression } from "plywood";
import { PreviewFilterMode } from "../../../client/components/preview-string-filter-menu/preview-string-filter-menu";
import { Dimension } from "../../models/dimension/dimension";
import { Essence } from "../../models/essence/essence";
import { FilterMode } from "../../models/filter/filter";
import { Timekeeper } from "../../models/timekeeper/timekeeper";

interface QueryParams {
  essence: Essence;
  timekeeper: Timekeeper;
  filterMode: PreviewFilterMode;
  searchText: string;
  limit: number;
  dimension: Dimension;
}

function filterExpression(params: QueryParams): Expression {
  const { dimension, essence, timekeeper, searchText, filterMode } = params;
  const { dataCube } = essence;
  const filter = essence.getEffectiveFilter(timekeeper, { unfilterDimension: dimension }).toExpression(dataCube);

  if (!searchText) return filter;

  switch (filterMode) {
    case FilterMode.CONTAINS:
      return filter.and(dimension.expression.contains(r(searchText)));
    case FilterMode.REGEX:
      return filter.and(dimension.expression.match(searchText));
  }
}

export function previewStringFilterQuery(params: QueryParams) {
  const { dimension, essence, limit } = params;
  const { dataCube } = essence;
  const nativeCount = dataCube.getMeasure("count");
  const measureExpression = nativeCount ? nativeCount.expression : $("main").count();

  return $("main")
    .filter(filterExpression(params))
    .split(dimension.expression, dimension.name)
    .apply("MEASURE", measureExpression)
    .sort($("MEASURE"), SortExpression.DESCENDING)
    .limit(limit);
}
