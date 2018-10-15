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
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { DateRange, FixedTimeFilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Filter } from "../../../common/models/filter/filter";
import { isValidTimeShift, TimeShift } from "../../../common/models/time-shift/time-shift";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { Button } from "../button/button";
import { DateRangePicker } from "../date-range-picker/date-range-picker";
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
  };

  onStartChange = (start: Date) => this.setState({ start });

  onEndChange = (end: Date) => this.setState({ end });

  setTimeShift = (shift: string) => this.setState({ shift });

  state: FixedTimeTabState = this.initialState();

  validate(): boolean {
    return this.validateFilter() || this.validateTimeShift();
  }

  validateTimeShift(): boolean {
    const { shift } = this.state;
    return isValidTimeShift(shift) && !this.props.essence.timeShift.equals(TimeShift.fromJS(shift));
  }

  validateFilter(): boolean {
    try {
      const newFilter = this.constructFixedFilter();
      return !this.props.essence.filter.equals(newFilter);
    } catch {
      return false;
    }
  }

  constructFixedFilter(): Filter {
    let { start, end } = this.state;
    const { essence: { filter, timezone }, dimension: { name } } = this.props;

    if (!start) {
      throw new Error("Couldn't construct time filter: No starting date.");
    }

    if (!end) {
      end = day.shift(start, timezone, 1);
    }

    if (start >= end) {
      throw new Error("Couldn't construct time filter: Start should be earlier than end.");
    }
    const clause = new FixedTimeFilterClause({ reference: name, values: List.of(new DateRange({ start, end })) });
    return filter.setClause(clause);
  }

  constructTimeShift(): TimeShift {
    return TimeShift.fromJS(this.state.shift);
  }

  onOkClick = () => {
    if (!this.validate()) return;
    const { clicker, onClose } = this.props;
    clicker.changeFilter(this.constructFixedFilter());
    clicker.changeComparisonShift(this.constructTimeShift());
    onClose();
  }

  render() {
    const { essence, timekeeper, dimension } = this.props;
    if (!dimension) return null;
    const { shift, start, end } = this.state;

    return <div>
      <DateRangePicker
        startTime={start}
        endTime={end}
        maxTime={essence.dataCube.getMaxTime(timekeeper)}
        timezone={essence.timezone}
        onStartChange={this.onStartChange}
        onEndChange={this.onEndChange}
      />
      <div className="cont">
        <TimeShiftSelector
          shift={shift}
          time={TimeRange.fromJS({ start, end })}
          onShiftChange={this.setTimeShift}
          timezone={essence.timezone}
          shiftValue={isValidTimeShift(shift) ? TimeShift.fromJS(shift) : null}
          errorMessage={!isValidTimeShift(shift) && STRINGS.invalidDurationFormat}
        />
      </div>
      <div className="ok-cancel-bar">
        <Button type="primary" onClick={this.onOkClick} disabled={!this.validate()} title={STRINGS.ok} />
        <Button type="secondary" onClick={this.props.onClose} title={STRINGS.cancel} />
      </div>
    </div>;
  }
}
