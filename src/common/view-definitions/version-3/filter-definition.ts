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

import { $, Expression, LiteralExpression, r, Set, TimeFloorExpression, TimeRange, TimeRangeExpression } from "plywood";
import { DataCube } from "../../models/data-cube/data-cube";
import { Dimension } from "../../models/dimension/dimension";
import { FilterClause, FilterSelection, SupportedAction } from "../../models/filter-clause/filter-clause";

export enum FilterType {
  boolean = "boolean",
  number = "number",
  string = "string",
  time = "time"
}

export interface BaseFilterClauseDefinition {
  type: FilterType;
  ref: string;
}

export interface NumberFilterClauseDefinition extends BaseFilterClauseDefinition {
  type: FilterType.number;
  not: boolean;
  ranges: Array<{ start: number, end: number, bounds?: string }>;
}

export interface StringFilterClauseDefinition extends BaseFilterClauseDefinition {
  type: FilterType.string;
  action: StringFilterAction;
  not: boolean;
  values: string[];
}

export interface BooleanFilterClauseDefinition extends BaseFilterClauseDefinition {
  type: FilterType.boolean;
  not: boolean;
  values: boolean[];
}

export interface TimeFilterClauseDefinition extends BaseFilterClauseDefinition {
  type: FilterType.time;
  timeRanges?: Array<{ start: string, end: string }>;
  timePeriods?: TimePeriodDefinition[];
}

export interface TimePeriodDefinition {
  type: "latest" | "floored";
  duration: string;
  step: number;
}

export enum StringFilterAction {
  in = "in",
  match = "match",
  contains = "contains"
}

export type FilterClauseDefinition =
  BooleanFilterClauseDefinition | NumberFilterClauseDefinition | StringFilterClauseDefinition | TimeFilterClauseDefinition;

export interface FilterDefinitionConversion<In extends FilterClauseDefinition> {
  toFilterClause(filter: In, dimension: Dimension): FilterClause;

  fromFilterClause(filterClause: FilterClause, dimension: Dimension): In;
}

const stringActionMap: { [action in StringFilterAction]: SupportedAction } = {
  in: SupportedAction.overlap,
  match: SupportedAction.match,
  contains: SupportedAction.contains
};

const booleanFilterClauseConverter: FilterDefinitionConversion<BooleanFilterClauseDefinition> = {
  toFilterClause(clauseDefinition: BooleanFilterClauseDefinition, dimension: Dimension): FilterClause {
    const { not, values } = clauseDefinition;
    const { expression } = dimension;
    const selection = r(values);

    return new FilterClause({ action: SupportedAction.overlap, exclude: not, expression, selection });
  },

  fromFilterClause(filterClause: FilterClause, dimension: Dimension): BooleanFilterClauseDefinition {
    const { exclude, selection } = filterClause;
    const { name: referenceName } = dimension;

    return {
      type: FilterType.boolean,
      ref: referenceName,
      values: (selection as LiteralExpression).value.elements,
      not: exclude
    };
  }
};

const stringFilterClauseConverter: FilterDefinitionConversion<StringFilterClauseDefinition> = {
  toFilterClause(clauseDefinition: StringFilterClauseDefinition, dimension: Dimension): FilterClause {
    const { action, not, values } = clauseDefinition;

    if (action === null) {
      throw Error(`String filter action cannot be empty. Dimension: ${dimension}`);
    }
    if (StringFilterAction[action] === undefined) {
      throw Error(`Unknown string filter action. Dimension: ${dimension}`);
    }
    if (action in [StringFilterAction.contains, StringFilterAction.match] && values.length !== 1) {
      throw Error(`Wrong string filter values: ${values} for action: ${action}. Dimension: ${dimension}`);
    }

    const { expression } = dimension;

    let selection: FilterSelection;
    if (action === StringFilterAction.in) {
      selection = r(values);
    } else if (action === StringFilterAction.contains) {
      selection = r(values[0]);
    } else if (action === StringFilterAction.match) {
      selection = values[0];
    }

    return new FilterClause({ action: stringActionMap[action], exclude: not, expression, selection });
  },

  fromFilterClause(filterClause: FilterClause, dimension: Dimension): StringFilterClauseDefinition {
    const { action, exclude, selection } = filterClause;
    const { name: referenceName } = dimension;

    switch (action) {
      case SupportedAction.overlap:
      case undefined:
        return {
          type: FilterType.string,
          ref: referenceName,
          action: StringFilterAction.in,
          values: (selection as LiteralExpression).value.elements,
          not: exclude
        };
      case SupportedAction.contains:
        return {
          type: FilterType.string,
          ref: referenceName,
          action: StringFilterAction.contains,
          values: [(selection as LiteralExpression).value],
          not: exclude
        };
      case SupportedAction.match:
        return {
          type: FilterType.string,
          ref: referenceName,
          action: StringFilterAction.match,
          values: [selection as string],
          not: exclude
        };
    }
  }
};

const numberFilterClauseConverter: FilterDefinitionConversion<NumberFilterClauseDefinition> = {
  toFilterClause(filterModel: NumberFilterClauseDefinition, dimension: Dimension): FilterClause {
    const { not, ranges } = filterModel;
    const { expression } = dimension;
    const selection: Expression = r(ranges);

    return new FilterClause({ action: SupportedAction.overlap, exclude: not, expression, selection });
  },

  fromFilterClause(filterClause: FilterClause, dimension: Dimension): NumberFilterClauseDefinition {
    const { exclude, selection } = filterClause;
    const { name: referenceName } = dimension;

    if (isNumberFilterSelection(selection) && selection.value instanceof Set) {
      return {
        type: FilterType.number,
        ref: referenceName,
        not: exclude,
        ranges: selection.value.elements.map(range => ({ start: range.start, end: range.end, bounds: range.bounds }))
      };
    } else {
      throw new Error(`Number filterClause expected, found: ${filterClause}. Dimension: ${referenceName}`);
    }
  }
};

const timeFilterClauseConverter: FilterDefinitionConversion<TimeFilterClauseDefinition> = {
  toFilterClause(filterModel: TimeFilterClauseDefinition, dimension: Dimension): FilterClause {
    const { timeRanges, timePeriods } = filterModel;

    if (timeRanges === undefined && timePeriods === undefined) {
      throw Error(`Time filter must have one of: timeRanges or timePeriods property. Dimension: ${dimension}`);
    }
    if (timeRanges !== undefined && timeRanges.length !== 1) {
      throw Error(`Time filter support a single timeRange only. Dimension: ${dimension}`);
    }
    if (timePeriods !== undefined && timePeriods.length !== 1) {
      throw Error(`Time filter support a single timePeriod only. Dimension: ${dimension}`);
    }

    const { expression } = dimension;

    let selection: Expression;
    if (timeRanges !== undefined && timeRanges.length === 1) {
      selection = r({ ...timeRanges[0], type: "TIME_RANGE" });
    } else if (timePeriods !== null && timePeriods.length === 1) {
      const timePeriod = timePeriods[0];
      selection = timePeriodToExpression(timePeriod);
    } else {
      throw new Error(`Wrong time filter definition: ${filterModel}`);
    }

    return new FilterClause({ action: SupportedAction.overlap, expression, selection });
  },

  fromFilterClause(filterClause: FilterClause, dimension: Dimension): TimeFilterClauseDefinition {
    const { selection } = filterClause;
    const { name: referenceName } = dimension;

    if (isFixedTimeRangeSelection(selection)) {
      const timeRange = selection.value as TimeRange;
      return {
        type: FilterType.time,
        ref: referenceName,
        timeRanges: [{ start: timeRange.start.toISOString(), end: timeRange.end.toISOString() }]
      };
    } else if (isRelativeTimeRangeSelection(selection)) {
      if (selection.operand instanceof TimeFloorExpression) {
        return {
          type: FilterType.time,
          ref: referenceName,
          timePeriods: [{ duration: selection.duration.toJS(), type: "floored", step: selection.step }]
        };
      } else {
        return {
          type: FilterType.time,
          ref: referenceName,
          timePeriods: [{ duration: selection.duration.toJS(), type: "latest", step: selection.step }]
        };
      }
    } else {
      throw new Error(`Time filterClause expected, found: ${filterClause}. Dimension: ${referenceName}`);
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
    if (clauseDefinition.ref == null) {
      throw new Error("Dimension name cannot be empty.");
    }

    const dimension = dataCube.getDimension(clauseDefinition.ref);

    if (dimension == null) {
      throw new Error(`Dimension ${clauseDefinition.ref} not found in data cube ${dataCube.name}.`);
    }

    const clauseConverter = filterClauseConverters[clauseDefinition.type];
    return clauseConverter.toFilterClause(clauseDefinition, dimension);
  },

  fromFilterClause(filterClause: FilterClause, dataCube: DataCube): FilterClauseDefinition {
    const { expression, selection } = filterClause;

    const dimension = dataCube.getDimensionByExpression(expression);

    if (isBooleanFilterSelection(selection)) {
      return booleanFilterClauseConverter.fromFilterClause(filterClause, dimension);
    } else if (isNumberFilterSelection(selection)) {
      return numberFilterClauseConverter.fromFilterClause(filterClause, dimension);
    } else if (isFixedTimeRangeSelection(selection) || isRelativeTimeRangeSelection(selection)) {
      return timeFilterClauseConverter.fromFilterClause(filterClause, dimension);
    } else {
      return stringFilterClauseConverter.fromFilterClause(filterClause, dimension);
    }
  }
};

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
  return selection instanceof TimeRangeExpression;
}
