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

import { $, Expression } from "plywood";
import { TimeFilterPeriod } from "../../../../common/models/filter-clause/filter-clause";
import { TimeShift } from "../../../../common/models/time-shift/time-shift";
import { MAX_TIME_REF_NAME, NOW_REF_NAME } from "../../../../common/models/time/time";

const $MAX_TIME = $(MAX_TIME_REF_NAME);
const $NOW = $(NOW_REF_NAME);

export interface TimeFilterPreset {
  name: string;
  duration: string;
}

export const LATEST_PRESETS: TimeFilterPreset[] = [
  { name: "1H", duration: "PT1H" },
  { name: "6H", duration: "PT6H" },
  { name: "1D", duration: "P1D" },
  { name: "7D", duration: "P7D" },
  { name: "30D", duration: "P30D" }
];

export const CURRENT_PRESETS: TimeFilterPreset[] = [
  { name: "D", duration: "P1D" },
  { name: "W", duration: "P1W" },
  { name: "M", duration: "P1M" },
  { name: "Q", duration: "P3M" },
  { name: "Y", duration: "P1Y" }
];

export const PREVIOUS_PRESETS: TimeFilterPreset[] = [
  { name: "D", duration: "P1D" },
  { name: "W", duration: "P1W" },
  { name: "M", duration: "P1M" },
  { name: "Q", duration: "P3M" },
  { name: "Y", duration: "P1Y" }
];

export interface ShiftPreset {
  label: string;
  shift: TimeShift;
}

export const COMPARISON_PRESETS: ShiftPreset[] = [
  { label: "Off", shift: TimeShift.empty() },
  { label: "D", shift: TimeShift.fromJS("P1D") },
  { label: "W", shift: TimeShift.fromJS("P1W") },
  { label: "M", shift: TimeShift.fromJS("P1M") },
  { label: "Q", shift: TimeShift.fromJS("P3M") }
];

export function constructFilter(period: TimeFilterPeriod, duration: string): Expression {
  switch (period) {
    case TimeFilterPeriod.PREVIOUS:
      return $NOW.timeFloor(duration).timeRange(duration, -1);
    case TimeFilterPeriod.LATEST:
      return $MAX_TIME.timeRange(duration, -1);
    case TimeFilterPeriod.CURRENT:
      return $NOW.timeFloor(duration).timeRange(duration, 1);
    default:
      return null;
  }
}

export function getTimeFilterPresets(period: TimeFilterPeriod): TimeFilterPreset[] {
   switch (period) {
    case TimeFilterPeriod.PREVIOUS:
      return PREVIOUS_PRESETS;
    case TimeFilterPeriod.LATEST:
      return LATEST_PRESETS;
    case TimeFilterPeriod.CURRENT:
      return CURRENT_PRESETS;
  }
}
