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

import { second, Timezone } from "chronoshift";
import { PlywoodRange, Range } from "plywood";
import { ContinuousValue } from "./interaction";

function orderValues(a: ContinuousValue, b: ContinuousValue, timezone: Timezone): [ContinuousValue, ContinuousValue] {
  if (a > b) return [b, a];
  if (b > a) return [a, b];
  return [a, shiftByOne(a, timezone)];
}

export function constructRange(a: ContinuousValue, b: ContinuousValue, timezone: Timezone): PlywoodRange {
  const [start, end] = orderValues(a, b, timezone);
  return Range.fromJS({ start, end });
}

export function shiftByOne(value: ContinuousValue, timezone: Timezone): ContinuousValue {
  return value instanceof Date ? second.shift(value, timezone, 1) : value + 1;
}
