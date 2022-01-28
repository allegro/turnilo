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

import { List } from "immutable";
import { $, Expression, LimitExpression, ply } from "plywood";
import { ClientDataCube } from "../../../common/models/data-cube/data-cube";
import { Dimension } from "../../../common/models/dimension/dimension";
import { findDimensionByName } from "../../../common/models/dimension/dimensions";
import { Essence } from "../../../common/models/essence/essence";
import { toExpression } from "../../../common/models/filter-clause/filter-clause";
import { Filter } from "../../../common/models/filter/filter";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { Sort } from "../../../common/models/sort/sort";
import { Split, toExpression as splitToExpression } from "../../../common/models/split/split";
import { TimeShiftEnv } from "../../../common/models/time-shift/time-shift-env";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { CANONICAL_LENGTH_ID } from "../../../common/utils/canonical-length/query";
import splitCanonicalLength from "../../../common/utils/canonical-length/split-canonical-length";
import timeFilterCanonicalLength from "../../../common/utils/canonical-length/time-filter-canonical-length";
import { assoc, thread } from "../../../common/utils/functional/functional";
import { SPLIT } from "../../config/constants";

const $main = $("main");

function applySeries(series: List<ConcreteSeries>, timeShiftEnv: TimeShiftEnv, nestingLevel = 0) {
  return (query: Expression) => {
    return series.reduce((query, series) => {
      return query.performAction(series.plywoodExpression(nestingLevel, timeShiftEnv));
    }, query);
  };
}

function applyLimit({ limit: value }: Split) {
  const limitExpression = new LimitExpression({ value });
  return (query: Expression) => query.performAction(limitExpression);
}

function applySort(sort: Sort) {
  return (query: Expression) => query.performAction(sort.toExpression());
}

function applyCanonicalLength(splits: List<Split>, dataCube: ClientDataCube) {
  return (exp: Expression) => {
    const canonicalLength = splits
      .map(split => splitCanonicalLength(split, dataCube))
      .filter(length => length !== null)
      .first();
    if (!canonicalLength) return exp;
    return exp.apply(CANONICAL_LENGTH_ID, canonicalLength);
  };
}

function applyDimensionFilter(dimensions: List<Dimension>, filter: Filter) {
  return (query: Expression) => {
    return dimensions.reduce((query, dimension) => {
      if (dimension.kind !== "string" || !dimension.multiValue) return query;
      const filterClause = filter.clauseForReference(dimension.name);
      if (!filterClause) return query;
      return query.filter(toExpression(filterClause, dimension));
    }, query);
  };
}

function applySplits(essence: Essence, timeShiftEnv: TimeShiftEnv): Expression {
  const { splits: { splits }, dataCube, filter } = essence;
  const firstSplit = splits.first();

  const splitsMap = splits.reduce<Record<string, Expression>>((map, split) => {
    const dimension = findDimensionByName(dataCube.dimensions, split.reference);
    const { name } = dimension;
    const expression = splitToExpression(split, dimension, timeShiftEnv);
    return assoc(map, name, expression);
  }, {});

  const dimensions = splits.map(split => findDimensionByName(dataCube.dimensions, split.reference));

  return thread(
    $main.split(splitsMap),
    applyDimensionFilter(dimensions, filter),
    applyCanonicalLength(splits, dataCube),
    applySeries(essence.getConcreteSeries(), timeShiftEnv),
    applySort(firstSplit.sort),
    applyLimit(firstSplit)
  );
}

export default function makeQuery(essence: Essence, timekeeper: Timekeeper): Expression {
  const { dataCube } = essence;

  const hasComparison = essence.hasComparison();
  const mainFilter = essence.getEffectiveFilter(timekeeper, { combineWithPrevious: hasComparison });

  const timeShiftEnv = essence.getTimeShiftEnv(timekeeper);

  const mainExp: Expression = ply()
    .apply("main", $main.filter(mainFilter.toExpression(dataCube)))
    .apply(CANONICAL_LENGTH_ID, timeFilterCanonicalLength(essence, timekeeper));

  const queryWithMeasures = applySeries(essence.getConcreteSeries(), timeShiftEnv)(mainExp);

  return queryWithMeasures
    .apply(SPLIT, applySplits(essence, timeShiftEnv));
}
