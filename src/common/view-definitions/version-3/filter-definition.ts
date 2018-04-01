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

import { $, Expression, LiteralExpression, r, TimeFloorExpression, TimeRangeExpression } from "plywood";
import { DataCube } from "../../models/data-cube/data-cube";
import { FilterClause, FilterSelection, SupportedAction } from "../../models/filter-clause/filter-clause";

export enum FilterType {
  boolean = "boolean",
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

export interface BooleanFilterClauseDefinition extends BaseFilterClauseDefinition {
  type: FilterType.boolean;
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
  include = "include"
}

export enum StringFilterAction {
  in = "in",
  match = "match",
  contains = "contains"
}

export type FilterClauseDefinition =
  BooleanFilterClauseDefinition | NumberFilterClauseDefinition | StringFilterClauseDefinition | TimeFilterClauseDefinition;

export interface FilterDefinitionConversion<In extends FilterClauseDefinition> {
  toFilterClause(filter: In, dataCube: DataCube): FilterClause;

  fromFilterClause(filterClause: FilterClause, dataCube: DataCube): In;
}

const stringActionMap: { [action in StringFilterAction]: SupportedAction } = {
  in: SupportedAction.overlap,
  match: SupportedAction.match,
  contains: SupportedAction.contains
};

const booleanFilterClauseConverter: FilterDefinitionConversion<BooleanFilterClauseDefinition> = {
  toFilterClause(clauseDefinition: BooleanFilterClauseDefinition, dataCube: DataCube): FilterClause {
    const { dimension, exclude, values } = clauseDefinition;

    const action = SupportedAction.overlap;
    const expression = dataCube.getDimension(dimension).expression;
    const selection = r(values);

    return new FilterClause({ action, exclude, expression, selection });
  },

  fromFilterClause(filterClause: FilterClause, dataCube: DataCube): BooleanFilterClauseDefinition {
    const { exclude, expression, selection } = filterClause;
    const { name: dimension } = dataCube.getDimensionByExpression(expression);

    return {
      type: FilterType.boolean,
      dimension,
      values: (selection as LiteralExpression).value.elements,
      exclude
    };
  }
};

const stringFilterClauseConverter: FilterDefinitionConversion<StringFilterClauseDefinition> = {
  toFilterClause(clauseDefinition: StringFilterClauseDefinition, dataCube: DataCube): FilterClause {
    const { dimension, action, exclude, values } = clauseDefinition;

    if (action === null)
      throw Error(`String filter action cannot be empty. Dimension: ${dimension}`);
    if (StringFilterAction[action] === undefined)
      throw Error(`Unknown string filter action. Dimension: ${dimension}`);
    if (action in [StringFilterAction.contains, StringFilterAction.match] && values.length !== 1)
      throw Error(`Wrong string filter values: ${values} for action: ${action}. Dimension: ${dimension}`);

    const expression = dataCube.getDimension(dimension).expression;
    let selection: FilterSelection;
    if (action === StringFilterAction.in) {
      selection = r(values);
    } else if (action === StringFilterAction.contains) {
      selection = r(values[0]);
    } else if (action === StringFilterAction.match) {
      selection = values[0];
    }

    return new FilterClause({ action: stringActionMap[action], exclude, expression, selection });
  },

  fromFilterClause(filterClause: FilterClause, dataCube: DataCube): StringFilterClauseDefinition {
    const { action, exclude, expression, selection } = filterClause;
    const { name: dimension } = dataCube.getDimensionByExpression(expression);

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
    }
  }
};

const numberFilterClauseConverter: FilterDefinitionConversion<NumberFilterClauseDefinition> = {
  toFilterClause(filterModel: NumberFilterClauseDefinition, dataCube: DataCube): FilterClause {
    const { dimension, action, exclude, range } = filterModel;

    if (action === null)
      throw Error(`String filter action cannot be empty. Dimension: ${dimension}`);
    if (action !== NumberFilterAction.include)
      throw Error(`Number filter action must be: ${NumberFilterAction.include}. Dimension: ${dimension}`);
    if (NumberFilterAction[action] === undefined)
      throw Error(`Unknown number filter action. Dimension: ${dimension}`);

    const expression = dataCube.getDimension(dimension).expression;
    const selection: Expression = r({ ...range, type: "NUMBER_RANGE" });

    return new FilterClause({ action: "include" as SupportedAction, exclude, expression, selection });
  },

  fromFilterClause(filterClause: FilterClause, dataCube: DataCube): NumberFilterClauseDefinition {
    const { expression, selection } = filterClause;
    const { name: dimension } = dataCube.getDimensionByExpression(expression);

    if (isNumberFilterSelection(selection)) {
      return {
        type: FilterType.number,
        dimension,
        action: NumberFilterAction.include,
        exclude: false,
        range: { start: selection.value.start, end: selection.value.end }
      };
    } else {
      throw new Error(`Number filterClause expected, found: ${filterClause}. Dimension: ${dimension}`);
    }
  }
};

const timeFilterClauseConverter: FilterDefinitionConversion<TimeFilterClauseDefinition> = {
  toFilterClause(filterModel: TimeFilterClauseDefinition, dataCube: DataCube): FilterClause {
    const { dimension, timeRanges, timePeriods } = filterModel;

    if (timeRanges === undefined && timePeriods === undefined)
      throw Error(`Time filter must have one of: timeRanges or timePeriods property. Dimension: ${dimension}`);
    if (timeRanges !== undefined && timeRanges.length !== 1)
      throw Error(`Time filter support a single timeRange only. Dimension: ${dimension}`);
    if (timePeriods !== undefined && timePeriods.length !== 1)
      throw Error(`Time filter support a single timePeriod only. Dimension: ${dimension}`);

    const expression = dataCube.getDimension(dimension).expression;

    let selection: Expression;
    if (timeRanges !== undefined && timeRanges.length === 1) {
      selection = r({ ...timeRanges[0], type: "TIME_RANGE" });
    } else if (timePeriods !== null && timePeriods.length === 1) {
      const timePeriod = timePeriods[0];
      selection = timePeriodToExpression(timePeriod);
    } else {
      throw new Error(`Wrong time filter definition: ${filterModel}`);
    }

    return new FilterClause({ action: "include" as SupportedAction, expression, selection });
  },

  fromFilterClause(filterClause: FilterClause, dataCube: DataCube): TimeFilterClauseDefinition {
    const { expression, selection } = filterClause;
    const { name: dimension } = dataCube.getDimensionByExpression(expression);

    if (isFixedTimeRangeSelection(selection)) {
      return {
        type: FilterType.time,
        dimension,
        timeRanges: [{ start: selection.value.start, end: selection.value.end }]
      };
    } else if (isRelativeTimeRangeSelection(selection)) {
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
      throw new Error(`Time filterClause expected, found: ${filterClause}. Dimension: ${dimension}`);
    }
  }
};

function timePeriodToExpression(timePeriod: TimePeriodDefinition): Expression {
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

const filterClauseConverters: { [type in FilterType]: FilterDefinitionConversion<FilterClauseDefinition> } = {
  boolean: booleanFilterClauseConverter,
  number: numberFilterClauseConverter,
  string: stringFilterClauseConverter,
  time: timeFilterClauseConverter
};

export interface FilterDefinitionConverter {
  toFilterClause(filter: FilterClauseDefinition, dataCube: DataCube): FilterClause;

  fromFilterClause(filterClause: FilterClause, dataCube: DataCube): FilterClauseDefinition;
}

export const filterDefinitionConverter: FilterDefinitionConverter = {
  toFilterClause(clauseDefinition: FilterClauseDefinition, dataCube: DataCube): FilterClause {
    if (clauseDefinition.dimension === null)
      throw new Error("Dimension name cannot be empty.");

    const clauseConverter = filterClauseConverters[clauseDefinition.type];
    return clauseConverter.toFilterClause(clauseDefinition, dataCube);
  },

  fromFilterClause(filterClause: FilterClause, dataCube: DataCube): FilterClauseDefinition {
    const { selection } = filterClause;

    if (isBooleanFilterSelection(selection)) {
      return booleanFilterClauseConverter.fromFilterClause(filterClause, dataCube);
    } else if (isNumberFilterSelection(selection)) {
      return numberFilterClauseConverter.fromFilterClause(filterClause, dataCube);
    } else if (isFixedTimeRangeSelection(selection) || isRelativeTimeRangeSelection(selection)) {
      return timeFilterClauseConverter.fromFilterClause(filterClause, dataCube);
    } else {
      return stringFilterClauseConverter.fromFilterClause(filterClause, dataCube);
    }
  }
};

function isBooleanFilterSelection(selection: FilterSelection): selection is LiteralExpression {
  return selection instanceof LiteralExpression && selection.type === "SET/BOOLEAN";
}

function isNumberFilterSelection(selection: FilterSelection): selection is LiteralExpression {
  return selection instanceof LiteralExpression && selection.type === "NUMBER_RANGE";
}

function isFixedTimeRangeSelection(selection: FilterSelection): selection is LiteralExpression {
  return selection instanceof LiteralExpression && selection.type === "TIME_RANGE";
}

function isRelativeTimeRangeSelection(selection: FilterSelection): selection is TimeRangeExpression {
  return selection instanceof TimeRangeExpression;
}
