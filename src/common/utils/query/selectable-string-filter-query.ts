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

import { $, Expression, r, RefExpression, SortExpression } from "plywood";
import { Dimension } from "../../models/dimension/dimension";
import { Essence } from "../../models/essence/essence";
import { Timekeeper } from "../../models/timekeeper/timekeeper";

interface QueryParams {
  essence: Essence;
  timekeeper: Timekeeper;
  limit: number;
  dimension: Dimension;
  searchText: string;
}

export function stringFilterOptionsQuery({ essence, timekeeper, limit, dimension, searchText }: QueryParams): Expression {
  const { dataCube } = essence;
  const nativeCount = dataCube.getMeasure("count");
  const $main = $("main");
  const measureExpression = nativeCount ? nativeCount.expression : $main.count();

  const filter = essence.getEffectiveFilter(timekeeper, { unfilterDimension: dimension }).toExpression(dataCube);

  const filterWithSearch = searchText ? filter.and(dimension.expression.contains(r(searchText), "ignoreCase")) : filter;

  let exp: Expression = $main.filter(filterWithSearch);
  const lookupField = dimension.getLookupExpressionField();
  if (lookupField) {
    exp = exp.split($(lookupField), lookupField).apply(dimension.name, $(lookupField)).apply("$label", dimension.expression);
  } else {
    exp = exp.split(dimension.expression, dimension.name);
  }
  return exp.apply("MEASURE", measureExpression)
    .sort($("MEASURE"), SortExpression.DESCENDING)
    .limit(limit);
}
