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
import { NumberRange, TimeRange } from "plywood";
import { getBestBucketUnitForRange } from "../../../../common/models/granularity/granularity";
import { ContinuousScale } from "./scale";

export type ContinuousTicks = Array<Date | number>;

export default function pickXAxisTicks(scale: ContinuousScale, timezone: Timezone): ContinuousTicks {
  const [start, end] = scale.domain();
  if (start instanceof Date && end instanceof Date) {
    const tickDuration = getBestBucketUnitForRange(TimeRange.fromJS({ start, end }), true) as Duration;
    return tickDuration.materialize(start, end as Date, timezone);
  }
  if (typeof start === "number" && typeof end === "number") {
    const unit = getBestBucketUnitForRange(NumberRange.fromJS({ start, end }), true) as number;
    let values: number[] = [];
    let iter = Math.round((start as number) * unit) / unit;

    while (iter <= end) {
      values.push(iter);
      iter += unit;
    }
    return values;
  }
  throw new Error(`Expected scale domain to be continuous. Got ${scale.domain()}`);
}
