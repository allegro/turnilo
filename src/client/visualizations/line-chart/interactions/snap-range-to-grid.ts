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
import { Duration } from "chronoshift";
import { NumberRange, PlywoodRange, TimeRange } from "plywood";
import { Essence } from "../../../../common/models/essence/essence";
import { ContinuousRange } from "../utils/continuous-types";
import { getContinuousSplit } from "../utils/splits";

function roundTo(v: number, roundTo: number) {
  return Math.round(Math.floor(v / roundTo)) * roundTo;
}

export function snapRangeToGrid(range: PlywoodRange, essence: Essence): ContinuousRange {
  // floors range to scale ranges
  const continuousSplit = getContinuousSplit(essence);

  if (TimeRange.isTimeRange(range)) {
    const { timezone } = essence;
    const duration = continuousSplit.bucket as Duration;
    return TimeRange.fromJS({
      start: duration.floor(range.start, timezone),
      end: duration.shift(duration.floor(range.end, timezone), timezone, 1)
    });
  }
  if (NumberRange.isNumberRange(range)) {
    const bucketSize = continuousSplit.bucket as number;
    const startFloored = roundTo((range as NumberRange).start, bucketSize);
    let endFloored = roundTo((range as NumberRange).end, bucketSize);

    if (endFloored - startFloored < bucketSize) {
      endFloored += bucketSize;
    }

    return NumberRange.fromJS({
      start: startFloored,
      end: endFloored
    });
  }

  return null;
}
