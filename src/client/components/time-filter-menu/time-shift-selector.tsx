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

import { Duration, Timezone } from "chronoshift";
import { TimeRange } from "plywood";
import * as React from "react";
import { TimeShift } from "../../../common/models/time-shift/time-shift";
import { Unary } from "../../../common/utils/functional/functional";
import { DisplayYear, formatTimeRange } from "../../../common/utils/time/time";
import { STRINGS } from "../../config/constants";
import { InputWithPresets } from "../input-with-presets/input-with-presets";
import { COMPARISON_PRESETS } from "./presets";

function timeShiftPreviewForRange({ shiftValue, time, timezone }: Pick<TimeShiftSelectorProps, "shiftValue" | "time" | "timezone">): string {
  if (time === null || shiftValue === null || shiftValue.isEmpty()) return null;
  const duration: Duration = shiftValue.valueOf();
  const shiftedTimeRange = TimeRange.fromJS({
    start: duration.shift(time.start, timezone, -1),
    end: duration.shift(time.end, timezone, -1),
    bounds: time.bounds
  });
  return formatTimeRange(shiftedTimeRange, timezone, DisplayYear.IF_DIFF);
}

export interface TimeShiftSelectorProps {
  shift: string;
  time: TimeRange;
  timezone: Timezone;
  onShiftChange: Unary<string, void>;
  errorMessage?: string;
  shiftValue?: TimeShift;
}

export const TimeShiftSelector: React.SFC<TimeShiftSelectorProps> = props => {
  const { onShiftChange, errorMessage, shift: selectedTimeShift } = props;
  const timeShiftPreview = timeShiftPreviewForRange(props);
  const presets = COMPARISON_PRESETS.map(({ shift, label }) => ({
    name: label,
    identity: shift.toJS()
  }));

  return <React.Fragment>
    <InputWithPresets
      title={STRINGS.timeShift}
      presets={presets}
      selected={selectedTimeShift}
      onChange={onShiftChange}
      errorMessage={errorMessage}
      placeholder="Custom time shift"/>
    {timeShiftPreview ? <div className="preview">{timeShiftPreview}</div> : null}
  </React.Fragment>;
};
