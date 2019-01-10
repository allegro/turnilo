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
import { $, Expression, LimitExpression, ply, SortExpression } from "plywood";
import { SPLIT } from "../../../client/config/constants";
import { toExpression as filterClauseToExpression } from "../../../common/models/filter-clause/filter-clause";
import { toExpression as splitToExpression } from "../../../common/models/split/split";
import { Colors } from "../../models/colors/colors";
import { CurrentPeriod, DataSeries, PreviousPeriod } from "../../models/data-series/data-series";
import { nominalName, plywoodExpressionKey } from "../../models/data-series/data-series-names";
import { Dimension } from "../../models/dimension/dimension";
import { Essence } from "../../models/essence/essence";
import { SeriesDerivation } from "../../models/series/series-definition";
import { DEFAULT_FORMAT } from "../../models/series/series-format";
import { Sort } from "../../models/sort/sort";
import { Timekeeper } from "../../models/timekeeper/timekeeper";
import { sortDirectionMapper } from "../../view-definitions/version-4/split-definition";
import { thread } from "../functional/functional";

interface PeriodFilters {
  current: Expression;
  previous?: Expression;
}

const $main = $("main");

function applySeries(dataSeries: List<DataSeries>, nestingLevel: number, filters?: PeriodFilters) {
  return (query: Expression) =>
    dataSeries.reduce((query, series) => {
      if (!filters) return query.performAction(series.toExpression(nestingLevel));
      // TODO: maybe add delta as next expression
      return query
        .performAction(series.toExpression(nestingLevel, new CurrentPeriod(filters.current)))
        .performAction(series.toExpression(nestingLevel, new PreviousPeriod(filters.previous)));
    }, query);
}

// TODO: check sorts for percentages & (delta | previous)
function applySortReferenceExpression(essence: Essence, query: Expression, nestingLevel: number, currentFilter: Expression, sort: Sort): Expression {
  // TODO: match apply expressions
  const { name: sortMeasureName, derivation, percentOf } = nominalName(sort.reference);
  if (sortMeasureName && derivation === SeriesDerivation.CURRENT) {
    const sortMeasure = essence.dataCube.getMeasure(sortMeasureName);
    if (sortMeasure && !essence.getEffectiveSelectedMeasures().contains(sortMeasure)) {
      // TODO: fix crude way of generating expression
      const dataSeries = new DataSeries(sortMeasure, DEFAULT_FORMAT);
      const currentPeriod = currentFilter ? new CurrentPeriod(currentFilter) : undefined;
      return query.performAction(dataSeries.toExpression(nestingLevel, currentPeriod));
    }
  }
  if (sortMeasureName && derivation === SeriesDerivation.DELTA) {
    // TODO: get name from transformation from DataSeries
    const currentReference = $(plywoodExpressionKey(sortMeasureName, SeriesDerivation.CURRENT));
    const previousReference = $(plywoodExpressionKey(sortMeasureName, SeriesDerivation.PREVIOUS));
    return query.apply(sort.reference, currentReference.subtract(previousReference));
  }
  return query;
}

function applySort(essence: Essence, sort: Sort, currentFilter: Expression, nestingLevel: number) {
  // It's possible to define sort on measure that's not selected thus we need to add apply expression for that measure.
  // We don't need add apply expressions for:
  //   * dimensions - they're already defined as apply expressions because of splits
  //   * selected measures - they're defined as apply expressions already
  //   * previous - we need to define them earlier so they're present here
  return (query: Expression) => {
    const queryWithReference = applySortReferenceExpression(essence, query, nestingLevel, currentFilter, sort);
    return queryWithReference.performAction(new SortExpression({
      expression: $(sort.reference),
      direction: sortDirectionMapper[sort.direction]
    }));
  };
}

function applyLimit(colors: Colors, limit: number, dimension: Dimension) {
  return (query: Expression) => {
    if (colors && colors.dimension === dimension.name) {
      return query.performAction(colors.toLimitExpression());
    }
    if (limit) {
      return query.performAction(new LimitExpression({ value: limit }));
    }
    if (dimension.kind === "number") {
      // Hack: Plywood converts groupBys to topN if the limit is below a certain threshold.  Currently sorting on dimension in a groupBy query does not
      // behave as expected and in the future plywood will handle this, but for now add a limit so a topN query is performed.
      // 5000 is just a randomly selected number that's high enough that it's not immediately obvious that there's a limit.
      return query.limit(5000);
    }
    return query;
  };
}

function applyHaving(colors: Colors, splitDimension: Dimension) {
  return (query: Expression): Expression => {
    if (colors && colors.dimension === splitDimension.name) {
      const havingFilter = colors.toHavingFilter(splitDimension.name);
      if (havingFilter) {
        return query.performAction(havingFilter);
      }
    }
    return query;
  };
}

function applySubSplit(nestingLevel: number, essence: Essence, dataSeries: List<DataSeries>, filters: PeriodFilters) {
  return (query: Expression) => {
    if (nestingLevel >= essence.splits.length()) return query;
    return query.apply(SPLIT, applySplit(nestingLevel, essence, dataSeries, filters));
  };
}

function applySplit(index: number, essence: Essence, dataSeries: List<DataSeries>, filters: PeriodFilters): Expression {
  const { splits, dataCube, colors } = essence;
  const hasComparison = essence.hasComparison();
  const split = splits.getSplit(index);
  const dimension = dataCube.getDimension(split.reference);
  const { sort, limit } = split;
  if (!sort) {
    throw new Error("something went wrong during query generation");
  }

  const nestingLevel = index + 1;

  const filterShift = hasComparison && { filter: filters.current, shift: essence.timeShift.valueOf() };

  const currentSplit = splitToExpression(split, dimension, filterShift);

  return thread(
    $main.split(currentSplit, dimension.name),
    applyHaving(colors, dimension),
    applySeries(dataSeries, nestingLevel, filters),
    applySort(essence, sort, filters && filters.current, nestingLevel),
    applyLimit(colors, limit, dimension),
    applySubSplit(nestingLevel, essence, dataSeries, filters)
  );
}

function getPeriodFilters(essence: Essence, timekeeper: Timekeeper): PeriodFilters {
  if (!essence.hasComparison()) return null;
  const timeDimension = essence.dataCube.getTimeDimension();
  const current = filterClauseToExpression(essence.currentTimeFilter(timekeeper), timeDimension);
  const previous = filterClauseToExpression(essence.previousTimeFilter(timekeeper), timeDimension);

  return { current, previous };
}

export default function makeQuery(essence: Essence, timekeeper: Timekeeper, highlightId?: string): Expression {
  const { splits, dataCube } = essence;
  if (splits.length() > dataCube.getMaxSplits()) throw new Error(`Too many splits in query. DataCube "${dataCube.name}" supports only ${dataCube.getMaxSplits()} splits`);

  const hasComparison = essence.hasComparison();
  const mainFilter = essence.getEffectiveFilter(timekeeper, { combineWithPrevious: hasComparison, highlightId });
  const measureExpressions = essence.getDataSeries();
  const periodFilters = getPeriodFilters(essence, timekeeper);

  const mainExp: Expression = ply().apply("main", $main.filter(mainFilter.toExpression(dataCube)));
  const queryWithSeries = applySeries(measureExpressions, 0, periodFilters)(mainExp);

  if (splits.length() > 0) {
    return queryWithSeries.apply(SPLIT, applySplit(0, essence, measureExpressions, periodFilters));
  }
  return queryWithSeries;
}
