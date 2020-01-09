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

import { Duration, Timezone } from "chronoshift";
import { Instance } from "immutable-class";
import { FilterTypes, FixedTimeFilterClause, RelativeTimeFilterClause, TimeFilterClause } from "../filter-clause/filter-clause";

export function isValidTimeShift(input: string): boolean {
  try {
    TimeShift.fromJS(input);
    return true;
  } catch {
    return false;
  }
}

export type TimeShiftValue = Duration;

export type TimeShiftJS = string;

export class TimeShift implements Instance<TimeShiftValue, TimeShiftJS> {

  static fromJS(timeShift: string): TimeShift {
    if (timeShift === null) {
      return TimeShift.empty();
    }
    return new TimeShift(Duration.fromJS(timeShift));
  }

  static empty(): TimeShift {
    return new TimeShift(null);
  }

  static isTimeShift(candidate: any): boolean {
    return candidate instanceof TimeShift;
  }

  constructor(public value: Duration) {
  }

  equals(other: any): boolean {
    if (!TimeShift.isTimeShift(other)) {
      return false;
    }
    if (this.value === null) {
      return other.value === null;
    }
    return this.value.equals(other.value);
  }

  toJS(): TimeShiftJS {
    return this.value === null ? null : this.value.toJS();
  }

  toJSON(): TimeShiftJS {
    return this.toJS();
  }

  valueOf(): TimeShiftValue {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  getDescription(capitalize = false) {
    return this.value.getDescription(capitalize);
  }

  toString(): string {
    return this.toJS() || "";
  }

  private isValidForTimeFilter(timeFilter: TimeFilterClause, timezone: Timezone): boolean {
    switch (timeFilter.type) {
      case FilterTypes.FIXED_TIME:
        const { values } = timeFilter as FixedTimeFilterClause;
        const range = values.first();
        return !range.intersects(range.shift(this.value, timezone));
      case FilterTypes.RELATIVE_TIME:
        const { duration } = timeFilter as RelativeTimeFilterClause;
        return this.value.getCanonicalLength() >= duration.getCanonicalLength();
      default:
        throw new Error(`Unknown time filter: ${timeFilter}`);
    }
  }

  constrainToFilter(timeFilter: TimeFilterClause, timezone: Timezone): TimeShift {
    return this.value && this.isValidForTimeFilter(timeFilter, timezone) ? this : TimeShift.empty();
  }
}
