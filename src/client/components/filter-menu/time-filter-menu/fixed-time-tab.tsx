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

import { day } from "chronoshift";
import { List } from "immutable";
import React from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { getMaxTime } from "../../../../common/models/data-cube/data-cube";
import { DateRange } from "../../../../common/models/date-range/date-range";
import { TimeDimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { FilterClause, FixedTimeFilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Locale } from "../../../../common/models/locale/locale";
import { isValidTimeShift, TimeShift } from "../../../../common/models/time-shift/time-shift";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Unary } from "../../../../common/utils/functional/functional";
import { Fn } from "../../../../common/utils/general/general";
import { STRINGS } from "../../../config/constants";
import { Button } from "../../button/button";
import { DateRangePicker } from "../../date-range-picker/date-range-picker";
import { TimeShiftSelector } from "./time-shift-selector";

export interface FixedTimeTabProps {
  essence: Essence;
  timekeeper: Timekeeper;
  locale: Locale;
  dimension: TimeDimension;
  onClose: Fn;
  clicker: Clicker;
  saveClause: Unary<FilterClause, void>;
}

export interface FixedTimeTabState {
  start: Date;
  end: Date;
  shift: string;
}

export class FixedTimeTab extends React.Component<FixedTimeTabProps, FixedTimeTabState> {

  initialState = (): FixedTimeTabState => {
    const { essence, timekeeper, dimension: { name } } = this.props;
    const shift = essence.timeShift.toJS();

    const timeFilter = essence.getEffectiveFilter(timekeeper).clauseForReference(name);
    if (timeFilter && timeFilter instanceof FixedTimeFilterClause && !timeFilter.values.isEmpty()) {
      const { start, end } = timeFilter.values.get(0);
      return { start, end, shift };
    }
    return { start: null, end: null, shift };
  };

  onStartChange = (start: Date) => this.setState({ start });

  onEndChange = (end: Date) => this.setState({ end });

  setTimeShift = (shift: string) => this.setState({ shift });

  state: FixedTimeTabState = this.initialState();

  createDateRange(): DateRange | null {
    const { start, end: maybeEnd } = this.state;
    if (!start) return null;
    const timezone = this.props.essence.timezone;
    const end = maybeEnd || day.shift(start, timezone, 1);
    if (start >= end) return null;
    return new DateRange({ start, end });
  }

  constructFixedClause(): FixedTimeFilterClause {
    const { dimension: { name: reference } } = this.props;

    const values = List.of(this.createDateRange());
    return new FixedTimeFilterClause({ reference, values });
  }

  constructTimeShift(): TimeShift {
    return TimeShift.fromJS(this.state.shift);
  }

  doesTimeShiftOverlap(): boolean {
    const shift = this.constructTimeShift();
    if (shift.isEmpty()) return false;
    const { essence: { timezone } } = this.props;
    const currentRange = this.createDateRange();
    const duration = shift.valueOf();
    const previousRange = currentRange.shift(duration, timezone);
    return currentRange.intersects(previousRange);
  }

  validateOverlap(): string | null {
    const periodsOverlap = this.isTimeShiftValid() && this.areDatesValid() && this.doesTimeShiftOverlap();
    return periodsOverlap ? STRINGS.overlappingPeriods : null;
  }

  isTimeShiftValid(): boolean {
    return isValidTimeShift(this.state.shift);
  }

  areDatesValid(): boolean {
    return this.createDateRange() !== null;
  }

  isFormValid(): boolean {
    return this.areDatesValid() && this.isTimeShiftValid() && !this.doesTimeShiftOverlap();
  }

  isFilterDifferent(): boolean {
    const { essence: { filter, timeShift }, dimension } = this.props;
    const newTimeShift = this.constructTimeShift();
    const oldClause = filter.getClauseForDimension(dimension);
    const newClause = this.constructFixedClause();
    return !oldClause.equals(newClause) || !timeShift.equals(newTimeShift);
  }

  validate(): boolean {
    return this.isFormValid() && this.isFilterDifferent();
  }

  onOkClick = () => {
    if (!this.validate()) return;
    const { saveClause, clicker, onClose } = this.props;
    saveClause(this.constructFixedClause());
    clicker.changeComparisonShift(this.constructTimeShift());
    onClose();
  };

  render() {
    const { locale, essence: { timezone, dataCube }, timekeeper, dimension, onClose } = this.props;
    if (!dimension) return null;
    const { shift, start, end } = this.state;
    const overlapError = this.validateOverlap();

    return <div>
      <DateRangePicker
        locale={locale}
        startTime={start}
        endTime={end}
        maxTime={getMaxTime(dataCube, timekeeper)}
        timezone={timezone}
        onStartChange={this.onStartChange}
        onEndChange={this.onEndChange}
      />
      <div className="cont">
        <TimeShiftSelector
          dimension={dimension}
          shift={shift}
          time={this.createDateRange()}
          onShiftChange={this.setTimeShift}
          timezone={timezone} />
        {overlapError && <div className="overlap-error-message">{overlapError}</div>}
      </div>
      <div className="ok-cancel-bar">
        <Button type="primary" onClick={this.onOkClick} disabled={!this.validate()} title={STRINGS.ok} />
        <Button type="secondary" onClick={onClose} title={STRINGS.cancel} />
      </div>
    </div>;
  }
}
