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

import { $, Expression, LiteralExpression, r, RefExpression, TimeFloorExpression, TimeRangeExpression } from "plywood";
import { FilterClause, FilterSelection, SupportedAction } from "../../models/filter-clause/filter-clause";

export enum FilterType {
  number = "number",
  string = "string",
  time = "time"
}

export interface BaseFilterClauseDefinition {
  type: FilterType;
  dimension: string;
}

export interface NumberFilterClauseDefinition extends BaseFilterClauseDefinition {
  type: FilterType.number;
  action: NumberFilterAction;
  exclude: boolean;
  range: { start?: number, end?: number };
}

export interface StringFilterClauseDefinition extends BaseFilterClauseDefinition {
  type: FilterType.string;
  action: StringFilterAction;
  exclude: boolean;
  values: string[];
}

export interface TimeFilterClauseDefinition extends BaseFilterClauseDefinition {
  type: FilterType.time;
  timeRanges?: [{ start: string, end: string }];
  timePeriods?: TimePeriodDefinition[];
}

export interface TimePeriodDefinition {
  type: "latest" | "floored";
  duration: string;
  step: number;
}

export enum NumberFilterAction {
  include = "include",
  exclude = "exclude"
}

export enum StringFilterAction {
  in = "in",
  match = "match",
  contains = "contains"
}

export type FilterClauseDefinition = NumberFilterClauseDefinition | StringFilterClauseDefinition | TimeFilterClauseDefinition;

export interface FilterDefinitionConversionStrategy<In extends BaseFilterClauseDefinition> {
  toFilterClause(filter: In): FilterClause;
}

export interface FilterClauseConversion {
  fromFilterClause(filterClause: FilterClause): FilterClauseDefinition;
}

export class FilterDefinitionConverter implements FilterDefinitionConversionStrategy<FilterClauseDefinition>, FilterClauseConversion {
  private readonly converters: {
    [type in FilterType]: FilterDefinitionConversionStrategy<BaseFilterClauseDefinition>
  } = {
    number: new NumberFilterClauseConverter(),
    string: new StringFilterClauseConverter(),
    time: new TimeFilterClauseConverter()
  };

  toFilterClause = (clauseDefinition: FilterClauseDefinition): FilterClause => {
    if (clauseDefinition.dimension === null)
      throw new Error("Dimension name cannot be empty.");

    const clauseConverter = this.converters[clauseDefinition.type];
    return clauseConverter.toFilterClause(clauseDefinition);
  }

  fromFilterClause = (filterClause: FilterClause): FilterClauseDefinition => {
    const { expression, selection, action, exclude } = filterClause;

    const dimension = (expression as RefExpression).name;

    if (selection instanceof LiteralExpression && selection.type === "NUMBER_RANGE") {
      return {
        type: FilterType.number,
        dimension,
        action: NumberFilterAction.include,
        exclude: false,
        range: { start: selection.value.start, end: selection.value.end }
      };
    } else if (selection instanceof LiteralExpression && selection.type === "TIME_RANGE") {
      return {
        type: FilterType.time,
        dimension,
        timeRanges: [{ start: selection.value.start, end: selection.value.end }]
      };
    } else if (selection instanceof TimeRangeExpression) {
      if (selection.operand instanceof TimeFloorExpression) {
        return {
          type: FilterType.time,
          dimension,
          timePeriods: [{ duration: selection.duration.toJS(), type: "floored", step: selection.step }]
        };
      } else {
        return {
          type: FilterType.time,
          dimension,
          timePeriods: [{ duration: selection.duration.toJS(), type: "latest", step: selection.step }]
        };
      }
    } else {
      switch (action) {
        case SupportedAction.overlap:
        case undefined:
          return {
            type: FilterType.string,
            dimension,
            action: StringFilterAction.in,
            values: (selection as LiteralExpression).value.elements,
            exclude
          };
        case SupportedAction.contains:
          return {
            type: FilterType.string,
            dimension,
            action: StringFilterAction.contains,
            values: [(selection as LiteralExpression).value],
            exclude
          };
        case SupportedAction.match:
          return {
            type: FilterType.string,
            dimension,
            action: StringFilterAction.match,
            values: [selection as string],
            exclude
          };
        default:
          return null;
      }
    }
  }
}

export class StringFilterClauseConverter implements FilterDefinitionConversionStrategy<StringFilterClauseDefinition> {
  stringActionMap: { [action in StringFilterAction]: SupportedAction } = {
    in: SupportedAction.overlap,
    match: SupportedAction.match,
    contains: SupportedAction.contains
  };

  toFilterClause(clauseDefinition: StringFilterClauseDefinition): FilterClause {
    const { dimension, action, exclude, values } = clauseDefinition;

    if (action === null)
      throw Error(`String filter action cannot be empty. Dimension: ${dimension}`);
    if (StringFilterAction[action] === undefined)
      throw Error(`Unknown string filter action. Dimension: ${dimension}`);
    if (action in [StringFilterAction.contains, StringFilterAction.match] && values.length !== 1)
      throw Error(`Wrong string filter values: ${values} for action: ${action}. Dimension: ${dimension}`);

    const expression = $(dimension);
    let selection: FilterSelection;
    if (action === StringFilterAction.in) {
      selection = r(values);
    } else if (action === StringFilterAction.contains) {
      selection = r(values[0]);
    } else if (action === StringFilterAction.match) {
      selection = values[0];
    }

    return new FilterClause({ action: this.stringActionMap[action], exclude, expression, selection });
  }
}

export class NumberFilterClauseConverter implements FilterDefinitionConversionStrategy<NumberFilterClauseDefinition> {
  toFilterClause(filterModel: NumberFilterClauseDefinition): FilterClause {
    const { dimension, action, exclude, range } = filterModel;

    if (action === null)
      throw Error(`String filter action cannot be empty. Dimension: ${dimension}`);
    if (action !== NumberFilterAction.include)
      throw Error(`Number filter action must be: ${NumberFilterAction.include}. Dimension: ${dimension}`);
    if (NumberFilterAction[action] === undefined)
      throw Error(`Unknown number filter action. Dimension: ${dimension}`);

    const expression = $(dimension);
    const selection: Expression = r({ ...range, type: "NUMBER_RANGE" });

    return new FilterClause({ action: "include" as SupportedAction, exclude, expression, selection });
  }
}

export class TimeFilterClauseConverter implements FilterDefinitionConversionStrategy<TimeFilterClauseDefinition> {
  toFilterClause(filterModel: TimeFilterClauseDefinition): FilterClause {
    const { dimension, timeRanges, timePeriods } = filterModel;

    if (timeRanges === undefined && timePeriods === undefined)
      throw Error(`Time filter must have one of: timeRanges or timePeriods property. Dimension: ${dimension}`);
    if (timeRanges !== undefined && timeRanges.length !== 1)
      throw Error(`Time filter support a single timeRange only. Dimension: ${dimension}`);
    if (timePeriods !== undefined && timePeriods.length !== 1)
      throw Error(`Time filter support a single timePeriod only. Dimension: ${dimension}`);

    const expression = $(dimension);

    let selection: Expression;
    if (timeRanges !== undefined && timeRanges.length === 1) {
      selection = r({ ...timeRanges[0], type: "TIME_RANGE" });
    } else if (timePeriods !== null && timePeriods.length === 1) {
      const timePeriod = timePeriods[0];
      selection = this.timePeriodToExpression(timePeriod);
    } else {
      throw new Error(`Wrong time filter definition: ${filterModel}`);
    }

    return new FilterClause({ action: "include" as SupportedAction, expression, selection });
  }

  timePeriodToExpression(timePeriod: TimePeriodDefinition): Expression {
    switch (timePeriod.type) {
      case "latest":
        return $(FilterClause.MAX_TIME_REF_NAME)
          .timeRange(timePeriod.duration, timePeriod.step);
      case "floored":
        return $(FilterClause.NOW_REF_NAME)
          .timeFloor(timePeriod.duration)
          .timeRange(timePeriod.duration, timePeriod.step);
    }
  }
}
