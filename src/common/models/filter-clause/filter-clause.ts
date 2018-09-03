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
import { $, Datum, Expression, r } from "plywood";
import { constructFilter } from "../../../client/components/time-filter-menu/presets";

type OmitType<T extends FilterDefinition> = Partial<Pick<T, Exclude<keyof T, "type">>>;

// export enum PlywoodFilterMethod {
//   OVERLAP = "overlap",
//   CONTAINS = "contains",
//   MATCH = "match"
// }
//
// export const filterAction2PlywoodMethod = (action: StringFilterAction): PlywoodFilterMethod => {
//   switch (action) {
//     case StringFilterAction.IN:
//       return PlywoodFilterMethod.OVERLAP;
//     case StringFilterAction.MATCH:
//       return PlywoodFilterMethod.MATCH;
//     case StringFilterAction.CONTAINS:
//       return PlywoodFilterMethod.CONTAINS;
//   }
// };
//
// export const plywoodMethod2FilterAction = (action: PlywoodFilterMethod): StringFilterAction => {
//   switch (action) {
//     case PlywoodFilterMethod.OVERLAP:
//       return StringFilterAction.IN;
//     case PlywoodFilterMethod.MATCH:
//       return StringFilterAction.MATCH;
//     case PlywoodFilterMethod.CONTAINS:
//       return StringFilterAction.CONTAINS;
//   }
// };

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

export interface NumberRange {
  start: number;
  end: number;
  bounds?: string;
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

export interface DateRange {
  start: Date;
  end: Date;
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
    return selection.defineEnvironment({ timezone }).getFn()(datum);
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
      const numExp = expression.overlap(r(values.toArray()));
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
      // TODO: wtf?
      return null;
    }
    case FilterTypes.RELATIVE_TIME: {
      // TODO: wtf?
      return null;
    }
  }
}

export const NOW_REF_NAME = "n";
export const MAX_TIME_REF_NAME = "m";

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
        // TODO: encode period
        period,
        duration: Duration.fromJS(duration)
      });
    }
  }
}

export function getValues(clause: FilterClause): ImmutableSet<boolean | string | NumberRange | DateRange> {
  switch (clause.type) {
    case FilterTypes.BOOLEAN: {
      const { values } = clause as BooleanFilterClause;
      return ImmutableSet(values);
    }
    case FilterTypes.NUMBER: {
      const { values } = clause as NumberFilterClause;
      return ImmutableSet(values);
    }
    case FilterTypes.STRING: {
      const { values } = clause as StringFilterClause;
      return ImmutableSet(values);
    }
    case FilterTypes.FIXED_TIME: {
      const { values } = clause as FixedTimeFilterClause;
      return ImmutableSet(values);
    }
    case FilterTypes.RELATIVE_TIME: {
      return null;
    }
  }
}

// public isLessThanFullDay(): boolean {
//   let extent = this.getExtent();
//   if (!extent) return false;
//   return extent.end.valueOf() - extent.start.valueOf() < day.canonicalLength;
// }
