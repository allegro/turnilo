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
import { Record } from "immutable";
import { Range } from "plywood";

interface DateRangeDefinition {
  start: Date;
  end: Date;
}

const defaultDateRange: DateRangeDefinition = { start: null, end: null };

const plywoodRange = ({ start, end }: DateRange) => Range.fromJS({ start, end, bounds: "()" });

export class DateRange extends Record<DateRangeDefinition>(defaultDateRange) {
  intersects(other: DateRange | null): boolean {
    return other instanceof DateRange && plywoodRange(this).intersects(plywoodRange(other));
  }

  shift(duration: Duration, timezone: Timezone): DateRange {
    return this
      .set("start", duration.shift(this.start, timezone, -1))
      .set("end", duration.shift(this.end, timezone, -1));
  }
}
