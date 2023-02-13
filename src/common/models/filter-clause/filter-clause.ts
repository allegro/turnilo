/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Duration, minute, Timezone } from "chronoshift";
import { List, Record, Set as ImmutableSet } from "immutable";
import {
  ContainsExpression,
  Datum,
  Expression,
  NumberRange as PlywoodNumberRange,
  r,
  Set as PlywoodSet,
  TimeRange
} from "plywood";
import { constructFilter } from "../../../client/components/filter-menu/time-filter-menu/presets";
import { DateRange } from "../date-range/date-range";
import { Dimension } from "../dimension/dimension";
import { MAX_TIME_REF_NAME, NOW_REF_NAME } from "../time/time";

type OmitType<T extends FilterDefinition> = Partial<Pick<T, Exclude<keyof T, "type">>>;

export enum FilterTypes { BOOLEAN = "boolean", NUMBER = "number", STRING = "string", FIXED_TIME = "fixed_time", RELATIVE_TIME = "relative_time" }

export interface FilterDefinition {
  reference: string;
  type: FilterTypes;
}

interface BooleanFilterDefinition extends FilterDefinition {
  not: boolean;
  // In Druid, Bools are represented as string dictionary
  values: ImmutableSet<string | boolean>;
}

const defaultBooleanFilter: BooleanFilterDefinition = {
  reference: null,
  type: FilterTypes.BOOLEAN,
  not: false,
  values: ImmutableSet([])
};

export class BooleanFilterClause extends Record<BooleanFilterDefinition>(defaultBooleanFilter) {
  constructor(params: OmitType<BooleanFilterDefinition>) {
    super(params);
  }
}

interface NumberRangeDefinition {
  start: number;
  end: number;
  bounds?: string;
}

const defaultNumberRange: NumberRangeDefinition = { start: null, end: null, bounds: "[)" };

export class NumberRange extends Record<NumberRangeDefinition>(defaultNumberRange) {
}

interface NumberFilterDefinition extends FilterDefinition {
  not: boolean;
  values: List<NumberRange>;
}

const defaultNumberFilter: NumberFilterDefinition = {
  reference: null,
  type: FilterTypes.NUMBER,
  not: false,
  values: List([])
};

export class NumberFilterClause extends Record<NumberFilterDefinition>(defaultNumberFilter) {

  constructor(params: OmitType<NumberFilterDefinition>) {
    super(params);
  }
}

export enum StringFilterAction {
  IN = "in",
  MATCH = "match",
  CONTAINS = "contains"
}

interface StringFilterDefinition extends FilterDefinition {
  not: boolean;
  action: StringFilterAction;
  values: ImmutableSet<string>;
  ignoreCase: boolean;
}

const defaultStringFilter: StringFilterDefinition = {
  reference: null,
  type: FilterTypes.STRING,
  not: false,
  action: StringFilterAction.CONTAINS,
  values: ImmutableSet([]),
  ignoreCase: false
};

export class StringFilterClause extends Record<StringFilterDefinition>(defaultStringFilter) {

  constructor(params: OmitType<StringFilterDefinition>) {
    super(params);
  }
}

interface FixedTimeFilterDefinition extends FilterDefinition {
  values?: List<DateRange>;
}

const defaultFixedTimeFilter: FixedTimeFilterDefinition = {
  reference: null,
  type: FilterTypes.FIXED_TIME,
  values: List([])
};

export class FixedTimeFilterClause extends Record<FixedTimeFilterDefinition>(defaultFixedTimeFilter) {

  constructor(params: OmitType<FixedTimeFilterDefinition>) {
    super(params);
  }
}

export enum TimeFilterPeriod { PREVIOUS = "previous", LATEST = "latest", CURRENT = "current" }

interface RelativeTimeFilterDefinition extends FilterDefinition {
  period: TimeFilterPeriod;
  duration: Duration;
}

const defaultRelativeTimeFilter: RelativeTimeFilterDefinition = {
  reference: null,
  type: FilterTypes.RELATIVE_TIME,
  period: TimeFilterPeriod.CURRENT,
  duration: null
};

export class RelativeTimeFilterClause extends Record<RelativeTimeFilterDefinition>(defaultRelativeTimeFilter) {
  constructor(params: OmitType<RelativeTimeFilterDefinition>) {
    super(params);
  }

  evaluate(now: Date, maxTime: Date, timezone: Timezone): FixedTimeFilterClause {
    const selection: Expression = constructFilter(this.period, this.duration.toJS());
    const maxTimeMinuteTop = minute.shift(minute.floor(maxTime || now, timezone), timezone, 1);
    const datum: Datum = {};
    datum[NOW_REF_NAME] = now;
    datum[MAX_TIME_REF_NAME] = maxTimeMinuteTop;
    const { start, end }: TimeRange = selection.defineEnvironment({ timezone }).getFn()(datum);
    return new FixedTimeFilterClause({ reference: this.reference, values: List.of(new DateRange({ start, end })) });
  }

  equals(other: any): boolean {
    return other instanceof RelativeTimeFilterClause &&
      this.reference === other.reference &&
      this.period === other.period &&
      this.duration.equals(other.duration);
  }
}

export type TimeFilterClause = FixedTimeFilterClause | RelativeTimeFilterClause;

export function isTimeFilter(clause: FilterClause): clause is TimeFilterClause {
  return clause instanceof FixedTimeFilterClause || clause instanceof RelativeTimeFilterClause;
}

export type FilterClause = BooleanFilterClause | NumberFilterClause | StringFilterClause | FixedTimeFilterClause | RelativeTimeFilterClause;

export function toExpression(clause: FilterClause, { expression }: Dimension): Expression {
  const { type } = clause;
  switch (type) {
    case FilterTypes.BOOLEAN: {
      const { not, values } = clause as BooleanFilterClause;
      const boolExp = expression.overlap(r(values.toArray()));
      return not ? boolExp.not() : boolExp;
    }
    case FilterTypes.NUMBER: {
      const { not, values } = clause as NumberFilterClause;
      const elements = values.toArray().map(range => new PlywoodNumberRange(range));
      const set = new PlywoodSet({ elements, setType: "NUMBER_RANGE" });
      const numExp = expression.overlap(r(set));
      return not ? numExp.not() : numExp;
    }
    case FilterTypes.STRING: {
      const { not, action, values, ignoreCase } = clause as StringFilterClause;
      let stringExp: Expression = null;
      switch (action) {
        case StringFilterAction.CONTAINS:
          stringExp = expression.contains(r(values.first()), ignoreCase ? ContainsExpression.IGNORE_CASE : ContainsExpression.NORMAL);
          break;
        case StringFilterAction.IN:
          stringExp = expression.overlap(r(values.toArray()));
          break;
        case StringFilterAction.MATCH:
          stringExp = expression.match(values.first());
          break;
      }
      return not ? stringExp.not() : stringExp;
    }
    case FilterTypes.FIXED_TIME: {
      const values = (clause as FixedTimeFilterClause).values.toArray();
      const elements = values.map(value => new TimeRange(value));
      return expression.overlap(r(new PlywoodSet({ elements, setType: "TIME_RANGE" })));
    }
    case FilterTypes.RELATIVE_TIME: {
      throw new Error("Can't call toExpression on RelativeFilterClause. Evaluate clause first");
    }
  }
}

export function fromJS(parameters: FilterDefinition): FilterClause {
  const { type, reference } = parameters;
  switch (type) {
    case FilterTypes.BOOLEAN: {
      const { not, values } = parameters as any;
      return new BooleanFilterClause({
        reference,
        not,
        values: ImmutableSet(values)
      });
    }
    case FilterTypes.NUMBER: {
      const { not, values } = parameters as any;
      return new NumberFilterClause({
        reference,
        not,
        values: List(values)
      });
    }
    case FilterTypes.STRING: {
      const { not, values, action } = parameters as any;
      return new StringFilterClause({
        reference,
        action,
        not,
        values: ImmutableSet(values)
      });
    }
    case FilterTypes.FIXED_TIME: {
      const { values } = parameters as any;
      return new FixedTimeFilterClause({
        reference,
        values: List(values)
      });
    }
    case FilterTypes.RELATIVE_TIME: {
      const { period, duration } = parameters as any;
      return new RelativeTimeFilterClause({
        reference,
        period,
        duration: Duration.fromJS(duration)
      });
    }
  }
}

export function isStringFilterClause(clause: FilterClause): clause is StringFilterClause {
  return clause.type === FilterTypes.STRING;
}

export function isBooleanFilterClause(clause: FilterClause): clause is BooleanFilterClause {
  return clause.type === FilterTypes.BOOLEAN;
}
