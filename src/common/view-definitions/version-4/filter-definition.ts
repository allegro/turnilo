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

import { Duration } from "chronoshift";
import { List, Set } from "immutable";
import { DataCube } from "../../models/data-cube/data-cube";
import { DateRange } from "../../models/date-range/date-range";
import { Dimension } from "../../models/dimension/dimension";
import { findDimensionByName } from "../../models/dimension/dimensions";
import {
  BooleanFilterClause,
  FilterClause,
  FixedTimeFilterClause,
  NumberFilterClause,
  NumberRange,
  RelativeTimeFilterClause,
  StringFilterAction,
  StringFilterClause,
  TimeFilterClause,
  TimeFilterPeriod
} from "../../models/filter-clause/filter-clause";

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
  ignoreCase: boolean;
  values: string[];
}

export interface BooleanFilterClauseDefinition extends BaseFilterClauseDefinition {
  type: FilterType.boolean;
  not: boolean;
  values: Array<boolean | string>;
}

export interface TimeFilterClauseDefinition extends BaseFilterClauseDefinition {
  type: FilterType.time;
  timeRanges?: Array<{ start: string, end: string }>;
  timePeriods?: TimePeriodDefinition[];
}

type TimePeriodType = "latest" | "floored";

export interface TimePeriodDefinition {
  type: TimePeriodType;
  duration: string;
  step: number;
}

export type FilterClauseDefinition =
  BooleanFilterClauseDefinition | NumberFilterClauseDefinition | StringFilterClauseDefinition | TimeFilterClauseDefinition;

export interface FilterDefinitionConversion<In extends FilterClauseDefinition, Out> {
  toFilterClause(filter: In, dimension: Dimension): Out;

  fromFilterClause(filterClause: Out): In;
}

const booleanFilterClauseConverter: FilterDefinitionConversion<BooleanFilterClauseDefinition, BooleanFilterClause> = {
  toFilterClause({ not, values }: BooleanFilterClauseDefinition, { name }: Dimension): BooleanFilterClause {
    return new BooleanFilterClause({ reference: name, not, values: Set(values) });
  },

  fromFilterClause({ values, not, reference }: BooleanFilterClause): BooleanFilterClauseDefinition {
    return {
      type: FilterType.boolean,
      ref: reference,
      values: values.toArray(),
      not
    };
  }
};

const stringFilterClauseConverter: FilterDefinitionConversion<StringFilterClauseDefinition, StringFilterClause> = {
  toFilterClause({ action, not, values, ignoreCase }: StringFilterClauseDefinition, dimension: Dimension): StringFilterClause {
    if (action === null) {
      throw Error(`String filter action cannot be empty. Dimension: ${dimension}`);
    }
    if (!(Object as any).values(StringFilterAction).includes(action)) {
      throw Error(`Unknown string filter action. Dimension: ${dimension}`);
    }
    if (action in [StringFilterAction.CONTAINS, StringFilterAction.MATCH] && values.length !== 1) {
      throw Error(`Wrong string filter values: ${values} for action: ${action}. Dimension: ${dimension}`);
    }
    const { name } = dimension;

    return new StringFilterClause({
      reference: name,
      action,
      not,
      ignoreCase,
      values: Set(values)
    });
  },

  fromFilterClause({ action, reference, not, values, ignoreCase }: StringFilterClause): StringFilterClauseDefinition {
    return {
      type: FilterType.string,
      ref: reference,
      action,
      values: values.toArray(),
      not,
      ignoreCase
    };
  }
};

const numberFilterClauseConverter: FilterDefinitionConversion<NumberFilterClauseDefinition, NumberFilterClause> = {
  toFilterClause({ not, ranges }: NumberFilterClauseDefinition, { name }: Dimension): NumberFilterClause {
    return new NumberFilterClause({ not, values: List(ranges.map(range => new NumberRange(range))), reference: name });
  },

  fromFilterClause({ not, reference, values }: NumberFilterClause): NumberFilterClauseDefinition {
    return {
      type: FilterType.number,
      ref: reference,
      not,
      ranges: values.toJS()
    };
  }
};

const timeFilterClauseConverter: FilterDefinitionConversion<TimeFilterClauseDefinition, TimeFilterClause> = {
  toFilterClause(filterModel: TimeFilterClauseDefinition, dimension: Dimension): TimeFilterClause {
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

    const { name } = dimension;
    if (timeRanges !== undefined) {
      return new FixedTimeFilterClause({
        reference: name,
        values: List(timeRanges.map(range => new DateRange({ start: new Date(range.start), end: new Date(range.end) })))
      });
    }
    const { duration, step, type } = timePeriods[0];
    return new RelativeTimeFilterClause({
      reference: name,
      duration: Duration.fromJS(duration).multiply(Math.abs(step)),
      period: timeFilterPeriod(step, type)
    });
  },

  fromFilterClause(filterClause: TimeFilterClause): TimeFilterClauseDefinition {
    const { reference } = filterClause;

    if (filterClause instanceof RelativeTimeFilterClause) {
      const { duration, period } = filterClause;
      const step = period === TimeFilterPeriod.CURRENT ? 1 : -1;
      const type = period === TimeFilterPeriod.LATEST ? "latest" : "floored";
      return {
        type: FilterType.time,
        ref: reference,
        timePeriods: [{ duration: duration.toString(), step, type }]
      };
    }
    const { values } = filterClause;
    return {
      type: FilterType.time,
      ref: reference,
      timeRanges: values.map(value => ({ start: value.start.toISOString(), end: value.end.toISOString() })).toArray()
    };
  }
};

function timeFilterPeriod(step: number, type: TimePeriodType): TimeFilterPeriod {
  if (type === "latest") {
    return TimeFilterPeriod.LATEST;
  }
  if (step === 1) {
    return TimeFilterPeriod.CURRENT;
  }
  return TimeFilterPeriod.PREVIOUS;
}

const filterClauseConverters: { [type in FilterType]: FilterDefinitionConversion<FilterClauseDefinition, FilterClause> } = {
  boolean: booleanFilterClauseConverter,
  number: numberFilterClauseConverter,
  string: stringFilterClauseConverter,
  time: timeFilterClauseConverter
};

export interface FilterDefinitionConverter {
  toFilterClause(filter: FilterClauseDefinition, dataCube: Pick<DataCube, "dimensions" | "name">): FilterClause;

  fromFilterClause(filterClause: FilterClause): FilterClauseDefinition;
}

export const filterDefinitionConverter: FilterDefinitionConverter = {
  toFilterClause(clauseDefinition: FilterClauseDefinition, dataCube: Pick<DataCube, "dimensions" | "name">): FilterClause {
    if (clauseDefinition.ref == null) {
      throw new Error("Dimension name cannot be empty.");
    }

    const dimension = findDimensionByName(dataCube.dimensions, clauseDefinition.ref);

    if (dimension == null) {
      throw new Error(`Dimension ${clauseDefinition.ref} not found in data cube ${dataCube.name}.`);
    }

    const clauseConverter = filterClauseConverters[clauseDefinition.type];
    return clauseConverter.toFilterClause(clauseDefinition, dimension);
  },

  fromFilterClause(filterClause: FilterClause): FilterClauseDefinition {
    if (filterClause instanceof BooleanFilterClause) {
      return booleanFilterClauseConverter.fromFilterClause(filterClause);
    }
    if (filterClause instanceof NumberFilterClause) {
      return numberFilterClauseConverter.fromFilterClause(filterClause);
    }
    if (filterClause instanceof FixedTimeFilterClause || filterClause instanceof RelativeTimeFilterClause) {
      return timeFilterClauseConverter.fromFilterClause(filterClause);
    }
    if (filterClause instanceof StringFilterClause) {
      return stringFilterClauseConverter.fromFilterClause(filterClause);
    }
    throw Error(`Unrecognized filter clause type ${filterClause}`);
  }
};
