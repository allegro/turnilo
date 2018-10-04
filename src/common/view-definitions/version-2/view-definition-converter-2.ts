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

import { Duration, Timezone } from "chronoshift";
import { List, OrderedSet, Set } from "immutable";
import { NamedArray } from "immutable-class";
import {
  AndExpression,
  ChainableExpression,
  ChainableUnaryExpression,
  ContainsExpression,
  Expression,
  InExpression,
  LiteralExpression,
  MatchExpression,
  NotExpression,
  OverlapExpression,
  RefExpression,
  Set as PlywoodSet,
  TimeBucketExpression,
  TimeFloorExpression,
  TimeRange,
  TimeRangeExpression
} from "plywood";
import { Colors } from "../../models/colors/colors";
import { DataCube } from "../../models/data-cube/data-cube";
import { Dimension } from "../../models/dimension/dimension";
import { createMeasures, Essence } from "../../models/essence/essence";
import {
  BooleanFilterClause,
  DateRange,
  FilterClause,
  FixedTimeFilterClause,
  NumberFilterClause,
  NumberRange,
  RelativeTimeFilterClause,
  StringFilterAction,
  StringFilterClause,
  TimeFilterPeriod
} from "../../models/filter-clause/filter-clause";
import { Filter } from "../../models/filter/filter";
import { Highlight } from "../../models/highlight/highlight";
import { Manifest } from "../../models/manifest/manifest";
import { Sort } from "../../models/sort/sort";
import { Split } from "../../models/split/split";
import { Splits } from "../../models/splits/splits";
import { TimeShift } from "../../models/time-shift/time-shift";
import { ViewDefinitionConverter } from "../view-definition-converter";
import { ViewDefinition2 } from "./view-definition-2";

export type FilterSelection = Expression | string;

export class ViewDefinitionConverter2 implements ViewDefinitionConverter<ViewDefinition2, Essence> {
  version = 2;

  fromViewDefinition(definition: ViewDefinition2, dataCube: DataCube, visualizations: Manifest[]): Essence {
    const visualization = NamedArray.findByName(visualizations, definition.visualization);

    const measures = createMeasures({
      isMulti: definition.multiMeasureMode,
      single: definition.singleMeasure,
      multi: OrderedSet(definition.selectedMeasures)
    });
    const timezone = definition.timezone && Timezone.fromJS(definition.timezone);
    const filter = Filter.fromClauses(filterJSConverter(definition.filter, dataCube));
    const pinnedDimensions = OrderedSet(definition.pinnedDimensions);
    const splits = Splits.fromSplits(splitJSConverter(definition.splits));
    const timeShift = TimeShift.empty();
    const colors = definition.colors && Colors.fromJS(definition.colors);
    const pinnedSort = dataCube.getMeasure(definition.pinnedSort) ? definition.pinnedSort : dataCube.getDefaultSortMeasure();
    const highlight = readHighlight(definition.highlight, dataCube);
    const compare: any = null;
    return new Essence({ dataCube, visualizations, visualization, timezone, filter, timeShift, splits, pinnedDimensions, measures, colors, pinnedSort, compare, highlight });
  }

  toViewDefinition(essence: Essence): ViewDefinition2 {
    throw new Error("toViewDefinition is not supported in Version 2");
  }
}

function readHighlight(definition: any, dataCube: DataCube): Highlight {
  if (!definition) return null;
  const { measure, owner } = definition;
  const delta = Filter.fromClauses(filterJSConverter(definition.delta, dataCube));
  return new Highlight({ measure, owner, delta });

}

function isBooleanFilterSelection(selection: FilterSelection): selection is LiteralExpression {
  return selection instanceof LiteralExpression && selection.type === "SET/BOOLEAN";
}

function isNumberFilterSelection(selection: FilterSelection): selection is LiteralExpression {
  return selection instanceof LiteralExpression && selection.type === "SET/NUMBER_RANGE";
}

function isFixedTimeRangeSelection(selection: FilterSelection): selection is LiteralExpression {
  return selection instanceof LiteralExpression && selection.type === "TIME_RANGE";
}

function isRelativeTimeRangeSelection(selection: FilterSelection): selection is TimeRangeExpression {
  return selection instanceof TimeRangeExpression || selection instanceof TimeBucketExpression;
}

function filterJSConverter(filter: any, dataCube: DataCube): FilterClause[] {
  const filterExpression = Expression.fromJSLoose(filter);
  if (filterExpression instanceof LiteralExpression && filterExpression.simple) return [];
  if (filterExpression instanceof AndExpression) {
    return filterExpression.getExpressionList().map(exp => convertFilterExpression(exp as ChainableUnaryExpression, dataCube));
  } else {
    return [convertFilterExpression(filterExpression as ChainableUnaryExpression, dataCube)];
  }
}

enum SupportedAction {
  overlap = "overlap",
  contains = "contains",
  match = "match"
}

function readBooleanFilterClause(selection: LiteralExpression, dimension: Dimension, not: boolean): BooleanFilterClause {
  const { name: reference } = dimension;

  return new BooleanFilterClause({ reference, values: Set(selection.value.elements), not });
}

function readNumberFilterClause(selection: LiteralExpression, dimension: Dimension, not: boolean): NumberFilterClause {
  const { name: reference } = dimension;

  if (isNumberFilterSelection(selection) && selection.value instanceof PlywoodSet) {
    const values = List(selection.value.elements.map((range: NumberRange) => new NumberRange(range)));
    return new NumberFilterClause({ reference, not, values });
  } else {
    throw new Error(`Number filterClause expected, found: ${selection}. Dimension: ${reference}`);
  }
}

function readFixedTimeFilter(selection: LiteralExpression, dimension: Dimension): FixedTimeFilterClause {
  const { name: reference } = dimension;

  return new FixedTimeFilterClause({ reference, values: List.of(new DateRange(selection.value as TimeRange)) });
}

function readRelativeTimeFilterClause(selection: TimeRangeExpression, dimension: Dimension): RelativeTimeFilterClause {
  const { name: reference } = dimension;
  if (selection.operand instanceof TimeFloorExpression) {
    const { step, duration } = selection;
    return new RelativeTimeFilterClause({
      reference,
      duration: duration.multiply(Math.abs(step)),
      period: step > 0 ? TimeFilterPeriod.CURRENT : TimeFilterPeriod.PREVIOUS
    });
  }
  return new RelativeTimeFilterClause({
    reference,
    period: TimeFilterPeriod.LATEST,
    duration: selection.duration
  });
}

function readStringFilterClause(selection: ChainableExpression, dimension: Dimension, exclude: boolean): StringFilterClause {
  const action = expressionAction(selection);
  const { name: reference } = dimension;

  switch (action) {
    case SupportedAction.contains:
      return new StringFilterClause({
        reference,
        action: StringFilterAction.CONTAINS,
        values: Set.of(((selection as ChainableUnaryExpression).expression as LiteralExpression).value),
        not: exclude
      });
    case SupportedAction.match:
      return new StringFilterClause({
        reference,
        action: StringFilterAction.MATCH,
        values: Set.of((selection as MatchExpression).regexp),
        not: exclude
      });
    case SupportedAction.overlap:
    case undefined:
    default:
      return new StringFilterClause({
        reference,
        action: StringFilterAction.IN,
        values: Set(((selection as ChainableUnaryExpression).expression as LiteralExpression).value.elements),
        not: exclude
      });
  }
}

function extractExclude(expression: ChainableUnaryExpression): { exclude: boolean, expression: ChainableUnaryExpression } {
  if (expression instanceof NotExpression) {
    return { exclude: true, expression: expression.operand as ChainableUnaryExpression };
  }
  return { exclude: false, expression };
}

function expressionAction(expression: ChainableExpression): SupportedAction {
  if (expression instanceof InExpression || expression instanceof OverlapExpression || expression instanceof ContainsExpression) {
    return expression.op as SupportedAction;
  }
  if (expression instanceof MatchExpression) {
    return SupportedAction.match;
  }
  throw new Error(`Unrecognized Supported Action for expression ${expression}`);
}

function convertFilterExpression(filter: ChainableUnaryExpression, dataCube: DataCube): FilterClause {
  const { expression, exclude } = extractExclude(filter);
  const dimensionName = (expression.operand as RefExpression).name;
  const dimension = dataCube.getDimension(dimensionName);

  if (isBooleanFilterSelection(expression.expression)) {
    return readBooleanFilterClause(expression.expression, dimension, exclude);
  } else if (isNumberFilterSelection(expression.expression)) {
    return readNumberFilterClause(expression.expression, dimension, exclude);
  } else if (isFixedTimeRangeSelection(expression.expression)) {
    return readFixedTimeFilter(expression.expression, dimension);
  } else if (isRelativeTimeRangeSelection(expression.expression as ChainableExpression)) {
    return readRelativeTimeFilterClause(expression.expression as TimeRangeExpression, dimension);
  } else {
    return readStringFilterClause(expression, dimension, exclude);
  }
}

function convertSplit(split: any): Split {
  const { sortAction, limitAction, expression, bucketAction } = split;
  const reference = (expression as RefExpression).name;
  const sort = sortAction && new Sort({
    reference: sortAction.expression.name,
    direction: sortAction.direction
  });
  const limit = limitAction && limitAction.value;
  const bucket = bucketAction && (bucketAction.op === "timeBucket" ? Duration.fromJS(bucketAction.duration) : bucketAction.size);
  return new Split({
    reference,
    sort,
    limit,
    bucket
  });
}

function splitJSConverter(splits: any[]): Split[] {
  return splits.map(split => convertSplit(split));
}
