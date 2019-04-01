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
import { SPLIT } from "../../../client/config/constants";
import { toExpression as splitToExpression } from "../../../common/models/split/split";
import { Colors } from "../../models/colors/colors";
import { Dimension } from "../../models/dimension/dimension";
import { Essence } from "../../models/essence/essence";
import { ConcreteSeries } from "../../models/series/concrete-series";
import { Sort } from "../../models/sort/sort";
import { TimeShiftEnv } from "../../models/time-shift/time-shift-env";
import { Timekeeper } from "../../models/timekeeper/timekeeper";
import { thread } from "../functional/functional";

const $main = $("main");

function applySeries(series: List<ConcreteSeries>, timeShiftEnv: TimeShiftEnv, nestingLevel = 0) {

  return (query: Expression) => {
    return series.reduce((query, series) => {
        return query.performAction(series.plywoodExpression(nestingLevel, timeShiftEnv));
    }, query);
  };
}

function applySort(sort: Sort) {
  return (query: Expression) => query.performAction(sort.toExpression());
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

function applySubSplit(nestingLevel: number, essence: Essence, timeShiftEnv: TimeShiftEnv) {
  return (query: Expression) => {
    if (nestingLevel >= essence.splits.length()) return query;
    return query.apply(SPLIT, applySplit(nestingLevel, essence, timeShiftEnv));
  };
}

function applySplit(index: number, essence: Essence, timeShiftEnv: TimeShiftEnv): Expression {
  const { splits, dataCube, colors } = essence;
  const split = splits.getSplit(index);
  const dimension = dataCube.getDimension(split.reference);
  const { sort, limit } = split;
  if (!sort) {
    throw new Error("something went wrong during query generation");
  }

  const nestingLevel = index + 1;

  const currentSplit = splitToExpression(split, dimension, timeShiftEnv);

  return thread(
    $main.split(currentSplit, dimension.name),
    applyHaving(colors, dimension),
    applySeries(essence.getConcreteSeries(), timeShiftEnv, nestingLevel),
    applySort(sort),
    applyLimit(colors, limit, dimension),
    applySubSplit(nestingLevel, essence, timeShiftEnv)
  );
}

export default function makeQuery(essence: Essence, timekeeper: Timekeeper): Expression {
  const { splits, dataCube } = essence;
  if (splits.length() > dataCube.getMaxSplits()) throw new Error(`Too many splits in query. DataCube "${dataCube.name}" supports only ${dataCube.getMaxSplits()} splits`);

  const hasComparison = essence.hasComparison();
  const mainFilter = essence.getEffectiveFilter(timekeeper, { combineWithPrevious: hasComparison });

  const timeShiftEnv: TimeShiftEnv = essence.getTimeShiftEnv(timekeeper);

  const mainExp: Expression = ply().apply("main", $main.filter(mainFilter.toExpression(dataCube)));

  const queryWithMeasures = applySeries(essence.getConcreteSeries(), timeShiftEnv)(mainExp);

  if (splits.length() > 0) {
    return queryWithMeasures.apply(SPLIT, applySplit(0, essence, timeShiftEnv));
  }
  return queryWithMeasures;
}
