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

import { $, Expression, LimitExpression, ply, SortExpression } from "plywood";
import { SPLIT } from "../../../client/config/constants";
import { toExpression as filterClauseToExpression } from "../../../common/models/filter-clause/filter-clause";
import { toExpression as splitToExpression } from "../../../common/models/split/split";
import { Colors } from "../../models/colors/colors";
import { Dimension } from "../../models/dimension/dimension";
import { Essence } from "../../models/essence/essence";
import { CurrentFilter, Measure, MeasureDerivation, PreviousFilter } from "../../models/measure/measure";
import { Sort } from "../../models/sort/sort";
import { Timekeeper } from "../../models/timekeeper/timekeeper";
import { sortDirectionMapper } from "../../view-definitions/version-3/split-definition";
import { thread } from "../functional/functional";

const $main = $("main");

function applyMeasures(essence: Essence, filters: Filters, nestingLevel = 0) {
  const measures = essence.getEffectiveMeasures();
  const hasComparison = essence.hasComparison();

  return (query: Expression) => {
    return measures.reduce((query, measure) => {
      if (!hasComparison) {
        return query.performAction(
          measure.toApplyExpression(nestingLevel)
        );
      }
      return query
        .performAction(measure.toApplyExpression(nestingLevel, new CurrentFilter(filters.current)))
        .performAction(measure.toApplyExpression(nestingLevel, new PreviousFilter(filters.previous)));
    }, query);
  };
}

function applySortReferenceExpression(essence: Essence, query: Expression, nestingLevel: number, currentFilter: Expression, sort: Sort): Expression {
  const { name: sortMeasureName, derivation } = Measure.nominalName(sort.reference);
  if (sortMeasureName && derivation === MeasureDerivation.CURRENT) {
    const sortMeasure = essence.dataCube.getMeasure(sortMeasureName);
    if (sortMeasure && !essence.getEffectiveMeasures().contains(sortMeasure)) {
      return query.performAction(sortMeasure.toApplyExpression(nestingLevel, new CurrentFilter(currentFilter)));
    }
  }
  if (sortMeasureName && derivation === MeasureDerivation.DELTA) {
    return query.apply(sort.reference, $(sortMeasureName).subtract($(Measure.derivedName(sortMeasureName, MeasureDerivation.PREVIOUS))));
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

function applySubSplit(nestingLevel: number, essence: Essence, filters: Filters) {
  return (query: Expression) => {
    if (nestingLevel >= essence.splits.length()) return query;
    return query.apply(SPLIT, applySplit(nestingLevel, essence, filters));
  };
}

function applySplit(index: number, essence: Essence, filters: Filters): Expression {
  const { splits, dataCube, colors } = essence;
  const hasComparison = essence.hasComparison();
  const split = splits.getSplit(index);
  const dimension = dataCube.getDimension(split.reference);
  const { sort, limit } = split;
  if (!sort) {
    throw new Error("something went wrong during query generation");
  }

  const nestingLevel = index + 1;

  const currentSplit = splitToExpression(split, dimension, hasComparison && filters.current, hasComparison && essence.timeShift.valueOf());

  return thread(
    $main.split(currentSplit, dimension.name),
    applyHaving(colors, dimension),
    applyMeasures(essence, filters, nestingLevel),
    applySort(essence, sort, filters.current, nestingLevel),
    applyLimit(colors, limit, dimension),
    applySubSplit(nestingLevel, essence, filters)
  );
}

interface Filters {
  current: Expression;
  previous?: Expression;
}

export default function makeQuery(essence: Essence, timekeeper: Timekeeper): Expression {
  const { splits } = essence;

  const hasComparison = essence.hasComparison();
  const mainFilter = essence.getEffectiveFilter(timekeeper, { combineWithPrevious: hasComparison, highlightId: this.id });

  const filters = {
    current: filterClauseToExpression(essence.currentTimeFilter(timekeeper)),
    previous: hasComparison ? filterClauseToExpression(essence.previousTimeFilter(timekeeper)) : undefined
  };

  const mainExp: Expression = ply().apply("main", $main.filter(mainFilter.toExpression()));

  const queryWithMeasures = applyMeasures(essence, filters)(mainExp);

  if (splits.length() > 0) {
    return queryWithMeasures.apply(SPLIT, applySplit(0, essence, filters));
  }
  return queryWithMeasures;
}
