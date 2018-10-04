/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Duration, minute, Timezone } from "chronoshift";
import { List, Record, Set as ImmutableSet } from "immutable";
import { $, Datum, Expression, NumberRange as PlywoodNumberRange, r, TimeRange } from "plywood";
import { constructFilter } from "../../../client/components/time-filter-menu/presets";
import { MAX_TIME_REF_NAME, NOW_REF_NAME } from "../time/time";

type OmitType<T extends FilterDefinition> = Partial<Pick<T, Exclude<keyof T, "type">>>;

export enum FilterTypes { BOOLEAN, NUMBER, STRING, FIXED_TIME, RELATIVE_TIME }

export interface FilterDefinition {
  reference: string;
  type: FilterTypes;
}

interface BooleanFilterDefinition extends FilterDefinition {
  not: boolean;
  values: ImmutableSet<boolean>;
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
}

const defaultStringFilter: StringFilterDefinition = {
  reference: null,
  type: FilterTypes.STRING,
  not: false,
  action: StringFilterAction.CONTAINS,
  values: ImmutableSet([])
};

export class StringFilterClause extends Record<StringFilterDefinition>(defaultStringFilter) {

  constructor(params: OmitType<StringFilterDefinition>) {
    super(params);
  }
}

interface DateRangeDefinition {
  start: Date;
  end: Date;
}

const defaultDateRange: DateRangeDefinition = { start: null, end: null };

export class DateRange extends Record<DateRangeDefinition>(defaultDateRange) {
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
}

export type TimeFilterClause = FixedTimeFilterClause | RelativeTimeFilterClause;

export function isTimeFilter(clause: FilterClause): clause is TimeFilterClause {
  return clause instanceof FixedTimeFilterClause || clause instanceof RelativeTimeFilterClause;
}

export type FilterClause = BooleanFilterClause | NumberFilterClause | StringFilterClause | FixedTimeFilterClause | RelativeTimeFilterClause;

export function toExpression(clause: FilterClause): Expression {
  const { type, reference } = clause;
  const expression = $(reference);
  switch (type) {
    case FilterTypes.BOOLEAN: {
      const { not, values } = clause as BooleanFilterClause;
      const boolExp = expression.overlap(r(values.toArray()));
      return not ? boolExp.not() : boolExp;
    }
    case FilterTypes.NUMBER: {
      const { not, values } = clause as NumberFilterClause;
      const numExp = expression.overlap(r(values.map(range => new PlywoodNumberRange(range)).toArray()));
      return not ? numExp.not() : numExp;
    }
    case FilterTypes.STRING: {
      const { not, action, values } = clause as StringFilterClause;
      let stringExp: Expression = null;
      switch (action) {
        case StringFilterAction.CONTAINS:
          stringExp = expression.contains(r(values.first()));
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
      return expression.overlap(r(new TimeRange((clause as FixedTimeFilterClause).values.first())));
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
      const { not, values } = parameters as any;
      return new StringFilterClause({
        reference,
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
