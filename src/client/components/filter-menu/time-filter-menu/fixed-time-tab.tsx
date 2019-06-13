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
import { day, month } from "chronoshift";
import { List } from "immutable";
import { TimeRange } from "plywood";
import * as React from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { DateRange } from "../../../../common/models/date-range/date-range";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { FixedTimeFilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Filter } from "../../../../common/models/filter/filter";
import { isValidTimeShift, TimeShift } from "../../../../common/models/time-shift/time-shift";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../../common/utils/general/general";
import {
  appendDays,
  datesEqual,
  formatYearMonth,
  getDayInMonth,
  monthToWeeks,
  prependDays
} from "../../../../common/utils/time/time";
import { getLocale, STRINGS } from "../../../config/constants";
import { classNames } from "../../../utils/dom/dom";
import { Button } from "../../button/button";
import { DateRangePicker } from "../../date-range-picker/date-range-picker";
import { SvgIcon } from "../../svg-icon/svg-icon";
import { TimeShiftSelector } from "./time-shift-selector";

export interface FixedTimeTabProps {
  essence: Essence;
  timekeeper: Timekeeper;
  dimension: Dimension;
  onClose: Fn;
  clicker: Clicker;
}

export interface FixedTimeTabState {
  start?: Date;
  end?: Date;
  shift: string;
  activeMonthStartDate?: Date;
  hoverTimeRange?: TimeRange;
  selectionSet?: boolean;
  dateRangePickers: List<any>;
  timeRanges: List<any>;
  numTimeRanges: int;
}

export class FixedTimeTab extends React.Component<FixedTimeTabProps, FixedTimeTabState> {
  initialState = (): FixedTimeTabState => {
    const { essence, timekeeper, dimension: { name } } = this.props;
    const shift = essence.timeShift.toJS();
    const timeFilter = essence.getEffectiveFilter(timekeeper).clauseForReference(name);
    if (timeFilter && timeFilter instanceof FixedTimeFilterClause && !timeFilter.values.isEmpty()) {
      if (timeFilter.values.size === 1) {
        const { start, end } = timeFilter.values.get(0);
        return { start, end, shift, activeMonthStartDate: null, hoverTimeRange: null, selectionSet: false, dateRangePickers: List(), timeRanges: List(), numTimeRanges: 1 };
      } else {
        const { start, end } = timeFilter.values.get(0);
        let dateRanges = List();
        for (let i = 0; i < timeFilter.values.size; i++) {
          dateRanges = dateRanges.push([timeFilter.values.get(i).start, timeFilter.values.get(i).end]);
        }
        return { start, end, shift, activeMonthStartDate: null, hoverTimeRange: null, selectionSet: false,
          dateRangePickers: List(), timeRanges: dateRanges, numTimeRanges: timeFilter.values.size };
      }
    }
    return { start: null, end: null, shift, activeMonthStartDate: null, hoverTimeRange: null, selectionSet: false, dateRangePickers: List(), timeRanges: List(), numTimeRanges: 1 };
  }

  componentWillMount() {
    const { start } = this.state;
    const { essence: { timezone } } = this.props;
    const flooredStart = month.floor(start || new Date(), timezone);
    this.setState({
      activeMonthStartDate: flooredStart,
      selectionSet: true
    });
  }

  onStartChange = (start: Date, index: int) => {
    const { timeRanges, numTimeRanges } = this.state;
    if (numTimeRanges === 1) {
      this.setState( { start });
    } else {
      let dateRanges = timeRanges.update(index, val => [start, timeRanges.get(index)[1]] );
      this.setState( { timeRanges: dateRanges });
    }
  }

  onEndChange = (end: Date, index: int) => {
    const { timeRanges, numTimeRanges } = this.state;
    if (numTimeRanges === 1) {
      this.setState( { end });
    } else {
      let dateRanges = timeRanges.update(index, val => [timeRanges.get(index)[0], end]);
      this.setState( { timeRanges: dateRanges });
    }
  }

  setTimeShift = (shift: string) => this.setState({ shift });
  state: FixedTimeTabState = this.initialState();

  createDateRange(start: Date, maybeEnd: Date): DateRange | null {
    if (!start) return null;
    const timezone = this.props.essence.timezone;
    const end = maybeEnd || day.shift(start, timezone, 1);
    if (start >= end) return null;
    return new DateRange({ start, end });
  }

  constructFixedFilter(dateRanges: List<any>): Filter {
    const { essence: { filter }, dimension: { name } } = this.props;
    const clause = new FixedTimeFilterClause({ reference: name, values: dateRanges });
    return filter.setClause(clause);
  }

  constructTimeShift(): TimeShift {
    return TimeShift.fromJS(this.state.shift);
  }

  validateTimeShift(): boolean {
    return isValidTimeShift(this.state.shift);
  }

  validate(): boolean {
    let dateRanges = List();
    const { timeRanges, numTimeRanges } = this.state;
    if (numTimeRanges === 1) {
      const { start, end } = this.state;
      let dateRange = this.createDateRange(start, end);
      if (!dateRange) return false;
      else {
        dateRanges = dateRanges.push(dateRange);
      }
    } else {
      for (let i = 0; i < numTimeRanges; i++) {
        let date = timeRanges.get(i);
        let dateRange = this.createDateRange(date[0], date[1]);
        if (!dateRange) return false;
        else {
          dateRanges = dateRanges.push(dateRange);
        }
      }
    }
    if (!this.validateTimeShift()) return false;
    const { essence: { filter, timeShift } } = this.props;
    const newTimeShift = this.constructTimeShift();
    const newFilter = this.constructFixedFilter(dateRanges);
    return !filter.equals(newFilter) || !timeShift.equals(newTimeShift);
  }

  onOkClick = () => {
    const { timeRanges, start, end, numTimeRanges } = this.state;
    if (!this.validate()) return;
    const { clicker, onClose } = this.props;
    if (timeRanges.size === 0) {
      let dateRanges = List(this.createDateRange(start, end));
      clicker.changeFilter(this.constructFixedFilter(dateRanges));
      clicker.changeComparisonShift(this.constructTimeShift());
      this.setState({ timeRanges: dateRanges });
      onClose();
    } else {
      let dateRanges = List();
      for (let i = 0; i < numTimeRanges; i++) {
        dateRanges = dateRanges.push(this.createDateRange(timeRanges.get(i)[0], timeRanges.get(i)[1]));
      }
      clicker.changeFilter(this.constructFixedFilter(dateRanges));
      clicker.changeComparisonShift(this.constructTimeShift());
      onClose();
    }
  }

  onTimeRangeClick = () => {
    const { timeRanges, numTimeRanges } = this.state;
    let dateRanges = timeRanges;
    if ( numTimeRanges === 1 ) {
      const { start, end } = this.state;
      dateRanges = timeRanges.push( [start, end]);
    }
    let start = dateRanges.get(numTimeRanges - 1)[0];
    let end = dateRanges.get(numTimeRanges - 1)[1];
    dateRanges = dateRanges.push( [start, end]);
    this.setState( { numTimeRanges: numTimeRanges + 1, timeRanges: dateRanges });
  }

  selectNewRange(startDate: Date, endDate?: Date) {
    const { essence: { timezone } } = this.props;
    const { numTimeRanges } = this.state;
    if (numTimeRanges === 1) {
      this.onStartChange(startDate, 0);
      // real end points are exclusive so +1 full day to selection (which is floored) to get the real end point
      if (endDate) endDate = day.shift(endDate, timezone, 1);
      this.onEndChange(endDate, 0);
    }
  }

  navigateToMonth(offset: number): void {
    const { essence: { timezone } } = this.props;
    const { activeMonthStartDate } = this.state;
    const newDate = month.shift(activeMonthStartDate, timezone, offset);
    this.setState({
      activeMonthStartDate: newDate
    });
  }

  goToPreviousMonth = () => this.navigateToMonth(-1);

  goToNextMonth = () => this.navigateToMonth(1);

  calculateHoverTimeRange(mouseEnteredDay: Date) {
    const { start, end } = this.state;
    let hoverTimeRange: TimeRange = null;
    if (start && !end) {
      let start = this.state.start;
      let end = mouseEnteredDay;
      // if mousing over backwards, set end to old start time
      if (mouseEnteredDay < start) {
        start = mouseEnteredDay;
        end = this.state.start;
      }
      hoverTimeRange = new TimeRange({ start, end, bounds: "[]" });
    }

    this.setState({ hoverTimeRange });
  }

  onCalendarMouseLeave = () => {
    this.setState({ hoverTimeRange: null });
  }

  selectDay(selection: Date): void {
    const { selectionSet, start } = this.state;

    if (selectionSet) {
      this.setState({ hoverTimeRange: null, selectionSet: false });
      this.selectNewRange(selection, null);
    } else {
      const isDoubleClickSameDay = datesEqual(selection, start);
      const isBackwardSelection = selection < start;

      if (isDoubleClickSameDay) {
        this.selectNewRange(start, start);
      } else if (isBackwardSelection) {
        this.selectNewRange(selection, start);
      } else {
        this.selectNewRange(start, selection);
      }
      this.setState({ selectionSet: true });
    }
  }

  getIsSelectable(date: Date): boolean {
    const { hoverTimeRange, selectionSet } = this.state;
    let inHoverTimeRange = hoverTimeRange && hoverTimeRange.contains(date);
    return inHoverTimeRange && !selectionSet;
  }

  renderDays(weeks: Date[][], monthStart: Date): JSX.Element[] {
    const { essence: { timezone, dataCube }, timekeeper } = this.props;
    const { start, end } = this.state;
    const startDay = day.floor(start, timezone);
    const dayBeforeEnd = end && day.shift(end, timezone, -1);
    const nextMonthStart = month.shift(monthStart, timezone, 1);

    return weeks.map((daysInWeek: Date[], row: number) => {
      return <div className="week" key={row}> {daysInWeek.map((dayDate: Date, column: number) => {
        const isPast = dayDate < monthStart;
        const isFuture = dayDate >= nextMonthStart;
        const isBeyondMaxRange = dayDate > dataCube.getMaxTime(timekeeper);
        const isSelected = startDay <= dayDate && dayDate < end;
        const isSelectedEdgeStart = datesEqual(dayDate, start);
        const isSelectedEdgeEnd = datesEqual(dayDate, dayBeforeEnd);
        const className = classNames("day", "value",
            {
              "past": isPast,
              "future": isFuture,
              "beyond-max-range": isBeyondMaxRange,
              "selectable": this.getIsSelectable(dayDate),
              "selected": isSelected,
              "selected-edge": isSelectedEdgeStart || isSelectedEdgeEnd
            });

        return <div
            className={className}
            key={column}
            onClick={this.selectDay.bind(this, dayDate)}
            onMouseEnter={this.calculateHoverTimeRange.bind(this, dayDate)}
        >{getDayInMonth(dayDate, timezone)}</div>;
      })}</div>;
    });
  }
  renderCalendar(startDate: Date): JSX.Element[] {
    const { essence: { timezone } } = this.props;
    const weeks: Date[][] = monthToWeeks(startDate, timezone, getLocale());
    const firstWeek = weeks[0];
    const lastWeek = weeks[weeks.length - 1];
    const countPrepend = 7 - firstWeek.length;
    const countAppend = 7 - lastWeek.length;
    weeks[0] = prependDays(timezone, firstWeek, countPrepend);
    weeks[weeks.length - 1] = appendDays(timezone, lastWeek, countAppend);
    return this.renderDays(weeks, startDate);
  }

  renderCalendarNav(startDate: Date): JSX.Element {
    const { essence: { timezone } } = this.props;

    return <div className="calendar-nav">
      <div
          className="caret left"
          onClick={this.goToPreviousMonth}
      >
        <SvgIcon svg={require("../../../icons/full-caret-left.svg")}/>
      </div>
      {formatYearMonth(startDate, timezone)}
      <div
          className="caret right"
          onClick={this.goToNextMonth}
      >
        <SvgIcon svg={require("../../../icons/full-caret-right.svg")}/>
      </div>
    </div>;
  }
  createDateRangePickers = () => {
    const { timeRanges, numTimeRanges } = this.state;
    const { essence: { dataCube, timezone }, timekeeper } = this.props;
    let pickers = [];
    for (let i = 0; i < numTimeRanges; i++) {
      pickers.push(
      <div>
      <Button type="secondary" title={"Delete"} onClick={() => this.setState( { timeRanges: timeRanges.splice(i, 1), numTimeRanges: numTimeRanges - 1 })} />
      <DateRangePicker
        startTime={timeRanges.get(i)[0]}
        endTime={timeRanges.get(i)[1]}
        maxTime={dataCube.getMaxTime(timekeeper)}
        timezone={timezone}
        onStartChange={this.onStartChange}
        onEndChange={this.onEndChange}
        index={i}/></div>);
    }
    return pickers;
  }

  render() {
    const { numTimeRanges } = this.state;
    const { essence: { dataCube, timezone }, timekeeper, dimension, onClose } = this.props;
    if (!dimension) return null;
    const { shift, start, end, activeMonthStartDate } = this.state;
    if (numTimeRanges === 1) {
      return <div>
        <DateRangePicker
            startTime={start}
            endTime={end}
            maxTime={dataCube.getMaxTime(timekeeper)}
            timezone={timezone}
            onStartChange={this.onStartChange}
            onEndChange={this.onEndChange}
            index={0}
        />
        <div
            className="calendar"
            onMouseLeave={this.onCalendarMouseLeave}
        >
          {this.renderCalendarNav(activeMonthStartDate)}
          <div className="week">
            {getLocale().shortDays.map((day, i) => {
              return <div className="day label" key={day + i}><span className="space"/>{day}</div>;
            })
            }
          </div>
          {this.renderCalendar(activeMonthStartDate)}
        </div>
        <div className="cont">
          <TimeShiftSelector
              shift={shift}
              time={this.createDateRange(start, end)}
              onShiftChange={this.setTimeShift}
              timezone={timezone}
              shiftValue={isValidTimeShift(shift) ? TimeShift.fromJS(shift) : null}
              errorMessage={!isValidTimeShift(shift) && STRINGS.invalidDurationFormat}
          />
        </div>
        <div className="ok-cancel-bar">
          <Button type="primary" onClick={this.onOkClick} disabled={!this.validate()} title={STRINGS.ok}/>
          <Button type="secondary" onClick={onClose} title={STRINGS.cancel}/>
          <Button type="secondary" title="Add Time Range" onClick={this.onTimeRangeClick}/>
        </div>
      </div>;
    } else {
      if (numTimeRanges < 5) {
        return <div><div className="datePickers">{this.createDateRangePickers()}</div>
          <div className="ok-cancel-bar">
            <Button type="primary" onClick={this.onOkClick} disabled={!this.validate()} title={STRINGS.ok}/>
            <Button type="secondary" onClick={onClose} title={STRINGS.cancel}/>
            <Button type="secondary" title="Add Time Range" onClick={this.onTimeRangeClick}/>
          </div>
        </div>;
      } else {
        return <div><div className="datePickers">{this.createDateRangePickers()}</div>
          <div className="ok-cancel-bar">
            <Button type="primary" onClick={this.onOkClick} disabled={!this.validate()} title={STRINGS.ok}/>
            <Button type="secondary" onClick={onClose} title={STRINGS.cancel}/>
            <Button type="secondary" title="Add Time Range" onClick={this.onTimeRangeClick}/>
          </div>
        </div>;
      }
    }
  }
}
