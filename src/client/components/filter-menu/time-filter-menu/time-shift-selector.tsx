/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import React from "react";
import { DateRange } from "../../../../common/models/date-range/date-range";
import { TimeDimension } from "../../../../common/models/dimension/dimension";
import { isValidTimeShift } from "../../../../common/models/time-shift/time-shift";
import { Unary } from "../../../../common/utils/functional/functional";
import { formatTimeRange } from "../../../../common/utils/time/time";
import { STRINGS } from "../../../config/constants";
import { Preset } from "../../input-with-presets/input-with-presets";
import { StringInputWithPresets } from "../../input-with-presets/string-input-with-presets";
import { normalizeDurationName } from "./presets";

function safeDurationFromJS(duration: string): Duration | null {
  try {
    return Duration.fromJS(duration);
  } catch {
    return null;
  }
}

function timeShiftPreviewForRange({
                                    shift,
                                    time,
                                    timezone
                                  }: Pick<TimeShiftSelectorProps, "shift" | "time" | "timezone">): string {
  if (time === null || !time.start || !time.end) return null;
  const duration: Duration = safeDurationFromJS(shift);
  if (duration === null) return null;
  const shiftedTimeRange = time.shift(duration, timezone);
  return formatTimeRange(shiftedTimeRange, timezone);
}

export interface TimeShiftSelectorProps {
  shift: string;
  dimension: TimeDimension;
  time: DateRange;
  timezone: Timezone;
  onShiftChange: Unary<string, void>;
}

function presets(dimension: TimeDimension): Array<Preset<string>> {
  return [
    { name: "Off", identity: null },
    ...dimension.timeShiftDurations.map(shift => ({
      name: normalizeDurationName(shift.toJS()),
      identity: shift.toJS()
    }))
  ];
}

export const TimeShiftSelector: React.FunctionComponent<TimeShiftSelectorProps> = props => {
  const { onShiftChange, dimension, shift: selectedTimeShift } = props;
  const timeShiftPreview = timeShiftPreviewForRange(props);

  return <React.Fragment>
    <StringInputWithPresets
      title={STRINGS.timeShift}
      presets={presets(dimension)}
      selected={selectedTimeShift}
      onChange={onShiftChange}
      errorMessage={isValidTimeShift(selectedTimeShift) ? null : STRINGS.invalidDurationFormat}
      placeholder={STRINGS.timeShiftExamples}/>
    {timeShiftPreview ? <div className="preview">{timeShiftPreview}</div> : null}
  </React.Fragment>;
};
