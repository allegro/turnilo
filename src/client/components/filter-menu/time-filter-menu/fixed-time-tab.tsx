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

import { day } from "chronoshift";
import { List } from "immutable";
import { TimeRange } from "plywood";
import * as React from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { DateRange, FixedTimeFilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Filter } from "../../../../common/models/filter/filter";
import { isValidTimeShift, TimeShift } from "../../../../common/models/time-shift/time-shift";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../../common/utils/general/general";
import { STRINGS } from "../../../config/constants";
import { Button } from "../../button/button";
import { DateRangePicker } from "../../date-range-picker/date-range-picker";
import { TimeShiftSelector } from "./time-shift-selector";

export interface FixedTimeTabProps {
  essence: Essence;
  timekeeper: Timekeeper;
  dimension: Dimension;
  onClose: Fn;
  clicker: Clicker;
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
  }

  onStartChange = (start: Date) => this.setState({ start });

  onEndChange = (end: Date) => this.setState({ end });

  setTimeShift = (shift: string) => this.setState({ shift });

  state: FixedTimeTabState = this.initialState();

  createDateRange(): DateRange {
    const { start, end: maybeEnd } = this.state;
    if (!start) return null;
    const end = maybeEnd || day.shift(start, this.props.essence.timezone, 1);
    if (start >= end) return null;
    return new DateRange({ start, end });
  }

  createTimeRange(): TimeRange | null {
    const dateRange = this.createDateRange();
    return dateRange && TimeRange.fromJS(dateRange);
  }

  constructFixedFilter(dateRange: DateRange): Filter {
    const { essence: { filter }, dimension: { name } } = this.props;

    const clause = new FixedTimeFilterClause({ reference: name, values: List.of(dateRange) });
    return filter.setClause(clause);
  }

  constructTimeShift(): TimeShift {
    return TimeShift.fromJS(this.state.shift);
  }

  validateTimeShift(): boolean {
    return isValidTimeShift(this.state.shift);
  }

  validate(): boolean {
    const dateRange = this.createDateRange();
    if (!dateRange) return false;
    if (!this.validateTimeShift()) return false;
    const { essence: { filter, timeShift } } = this.props;
    const newTimeShift = this.constructTimeShift();
    const newFilter = this.constructFixedFilter(dateRange);
    return !filter.equals(newFilter) || !timeShift.equals(newTimeShift);
  }

  onOkClick = () => {
    if (!this.validate()) return;
    const { clicker, onClose } = this.props;
    clicker.changeFilter(this.constructFixedFilter(this.createDateRange()));
    clicker.changeComparisonShift(this.constructTimeShift());
    onClose();
  }

  render() {
    const { essence: { timezone, dataCube }, timekeeper, dimension, onClose } = this.props;
    if (!dimension) return null;
    const { shift, start, end } = this.state;

    return <div>
      <DateRangePicker
        startTime={start}
        endTime={end}
        maxTime={dataCube.getMaxTime(timekeeper)}
        timezone={timezone}
        onStartChange={this.onStartChange}
        onEndChange={this.onEndChange}
      />
      <div className="cont">
        <TimeShiftSelector
          shift={shift}
          time={this.createTimeRange()}
          onShiftChange={this.setTimeShift}
          timezone={timezone}
          shiftValue={isValidTimeShift(shift) ? TimeShift.fromJS(shift) : null}
          errorMessage={!isValidTimeShift(shift) && STRINGS.invalidDurationFormat}
        />
      </div>
      <div className="ok-cancel-bar">
        <Button type="primary" onClick={this.onOkClick} disabled={!this.validate()} title={STRINGS.ok} />
        <Button type="secondary" onClick={onClose} title={STRINGS.cancel} />
      </div>
    </div>;
  }
}
