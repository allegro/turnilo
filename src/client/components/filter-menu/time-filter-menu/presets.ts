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
import { MAX_TIME_REF_NAME, NOW_REF_NAME } from "../../../../common/models/time/time";
import { isTruthy } from "../../../../common/utils/general/general";

const $MAX_TIME = $(MAX_TIME_REF_NAME);
const $NOW = $(NOW_REF_NAME);

export interface TimeFilterPreset {
  name: string;
  duration: string;
}

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

export const DEFAULT_TIME_SHIFT_DURATIONS = [
  "P1D", "P1W", "P1M", "P3M"
];

export const DEFAULT_LATEST_PERIOD_DURATIONS = [
  "PT1H", "PT6H", "P1D", "P7D", "P30D"
];

const SINGLE_COMPONENT_DURATION = /^PT?(\d+)([YMWDHS])$/;
const MULTI_COMPONENT_DURATION = /^PT?([\dTYMWDHS]+)$/;

export function normalizeDurationName(duration: string): string {
  const singleComponent = duration.match(SINGLE_COMPONENT_DURATION);
  if (isTruthy(singleComponent)) {
    const [, count, period] = singleComponent;
    if (count === "1") return period;
    return `${count}${period}`;
  }
  const multiComponent = duration.match(MULTI_COMPONENT_DURATION);
  if (isTruthy(multiComponent)) {
    const [, periods] = multiComponent;
    return periods;
  }
  return duration;
}

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

export function getTimeFilterPresets(period: TimeFilterPeriod.CURRENT | TimeFilterPeriod.PREVIOUS): TimeFilterPreset[] {
  switch (period) {
    case TimeFilterPeriod.PREVIOUS:
      return PREVIOUS_PRESETS;
    case TimeFilterPeriod.CURRENT:
      return CURRENT_PRESETS;
  }
}
