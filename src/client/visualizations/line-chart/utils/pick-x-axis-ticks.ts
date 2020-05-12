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
import { range } from "d3";
import { NumberRange, TimeRange } from "plywood";
import { getBestBucketUnitForRange } from "../../../../common/models/granularity/granularity";
import { ContinuousDomain } from "./continuous-types";

export type ContinuousTicks = Array<Date | number>;

function generateDateTicks(bucket: Duration, start: Date, end: Date, timezone: Timezone): Date[] {
  return bucket.materialize(start, end as Date, timezone);
}

function generateNumberTicks(bucket: number, start: number, end: number): number[] {
  const sequence = range(start, end, bucket);
  return [...sequence, end];
}

export default function pickXAxisTicks([start, end]: ContinuousDomain, timezone: Timezone): ContinuousTicks {
  if (start instanceof Date && end instanceof Date) {
    const bucket = getBestBucketUnitForRange(TimeRange.fromJS({ start, end }), true) as Duration;
    return generateDateTicks(bucket, start, end, timezone);
  }
  if (typeof start === "number" && typeof end === "number") {
    const bucket = getBestBucketUnitForRange(NumberRange.fromJS({ start, end }), true) as number;
    return generateNumberTicks(bucket, start, end);
  }
  throw new Error(`Expected domain to be continuous. Got [${start}, ${end}]`);
}
