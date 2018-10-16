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
import { Essence } from "../../models/essence/essence";
import { CurrentFilter, Measure, MeasureDerivation, PreviousFilter } from "../../models/measure/measure";
import { Timekeeper } from "../../models/timekeeper/timekeeper";
import { sortDirectionMapper } from "../../view-definitions/version-3/split-definition";

export default function makeQuery(essence: Essence, timekeeper: Timekeeper): Expression {
  const { splits, colors, dataCube } = essence;
  const measures = essence.getEffectiveMeasures();

  const $main = $("main");

  const hasComparison = essence.hasComparison();
  const mainFilter = essence.getEffectiveFilter(timekeeper, { combineWithPrevious: hasComparison, highlightId: this.id });

  const currentFilter = filterClauseToExpression(essence.currentTimeFilter(timekeeper));
  const previousFilter = hasComparison ? filterClauseToExpression(essence.previousTimeFilter(timekeeper)) : null;

  const mainExp: Expression = ply().apply("main", $main.filter(mainFilter.toExpression()));

  function applyMeasures(query: Expression, nestingLevel = 0): Expression {
    return measures.reduce((query, measure) => {
      if (!hasComparison) {
        return query.performAction(
          measure.toApplyExpression(nestingLevel)
        );
      }
      return query
        .performAction(measure.toApplyExpression(nestingLevel, new CurrentFilter(currentFilter)))
        .performAction(measure.toApplyExpression(nestingLevel, new PreviousFilter(previousFilter)));
    }, query);
  }

  const queryWithMeasures = applyMeasures(mainExp);

  function applySplit(i: number): Expression {
    const split = splits.getSplit(i);
    const splitDimension = dataCube.getDimension(split.reference);
    const { sort, limit } = split;
    if (!sort) {
      throw new Error("something went wrong during query generation");
    }

    const currentSplit = splitToExpression(split, hasComparison && currentFilter, hasComparison && essence.timeShift.valueOf());
    let subQuery: Expression =
      $main.split(currentSplit, splitDimension.name);

    if (colors && colors.dimension === splitDimension.name) {
      const havingFilter = colors.toHavingFilter(splitDimension.name);
      if (havingFilter) {
        subQuery = subQuery.performAction(havingFilter);
      }
    }

    const nestingLevel = i + 1;

    subQuery = applyMeasures(subQuery, nestingLevel);

    // It's possible to define sort on measure that's not selected thus we need to add apply expression for that measure.
    // We don't need add apply expressions for:
    //   * dimensions - they're already defined as apply expressions because of splits
    //   * selected measures - they're defined as apply expressions already
    //   * previous - we need to define them earlier so they're present here
    const { name: sortMeasureName, derivation } = Measure.nominalName(sort.reference);
    if (sortMeasureName && derivation === MeasureDerivation.CURRENT) {
      const sortMeasure = dataCube.getMeasure(sortMeasureName);
      if (sortMeasure && !measures.contains(sortMeasure)) {
        subQuery = subQuery.performAction(sortMeasure.toApplyExpression(nestingLevel, new CurrentFilter(currentFilter)));
      }
    }
    if (sortMeasureName && derivation === MeasureDerivation.DELTA) {
      subQuery = subQuery.apply(sort.reference, $(sortMeasureName).subtract($(Measure.derivedName(sortMeasureName, MeasureDerivation.PREVIOUS))));
    }
    subQuery = subQuery.performAction(new SortExpression({
      expression: $(sort.reference),
      direction: sortDirectionMapper[sort.direction]
    }));

    if (colors && colors.dimension === splitDimension.name) {
      subQuery = subQuery.performAction(colors.toLimitExpression());
    } else if (limit) {
      subQuery = subQuery.performAction(new LimitExpression({ value: limit }));
    } else if (splitDimension.kind === "number") {
      // Hack: Plywood converts groupBys to topN if the limit is below a certain threshold.  Currently sorting on dimension in a groupBy query does not
      // behave as expected and in the future plywood will handle this, but for now add a limit so a topN query is performed.
      // 5000 is just a randomly selected number that's high enough that it's not immediately obvious that there's a limit.
      subQuery = subQuery.limit(5000);
    }

    if (i + 1 < splits.length()) {
      subQuery = subQuery.apply(SPLIT, applySplit(i + 1));
    }

    return subQuery;
  }

  if (splits.length() > 0) {
    return queryWithMeasures.apply(SPLIT, applySplit(0));
  }
  return queryWithMeasures;
}
