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

import { day, month, Timezone } from "chronoshift";
import { TimeRange } from "plywood";
import * as React from "react";
import {
  appendDays,
  datesEqual,
  getEndWallTimeInclusive,
  getWallTimeDay,
  getWallTimeMonthWithYear,
  monthToWeeks,
  prependDays,
  shiftOneDay,
  wallTimeInclusiveEndEqual
} from "../../../common/utils/time/time";
import { getLocale } from "../../config/constants";
import { classNames } from "../../utils/dom/dom";
import { DateRangeInput } from "../date-range-input/date-range-input";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./date-range-picker.scss";

export interface DateRangePickerProps {
  startTime?: Date;
  endTime?: Date;
  maxTime?: Date;
  timezone: Timezone;
  onStartChange: (t: Date) => void;
  onEndChange: (t: Date) => void;
}

export interface DateRangePickerState {
  activeMonthStartDate?: Date;
  hoverTimeRange?: TimeRange;
  selectionSet?: boolean;
}

export class DateRangePicker extends React.Component<DateRangePickerProps, DateRangePickerState> {
  constructor(props: DateRangePickerProps) {
    super(props);
    this.state = {
      activeMonthStartDate: null,
      hoverTimeRange: null,
      selectionSet: false
    };
  }

  componentWillMount() {
    const { startTime, endTime, timezone } = this.props;

    const flooredStart = month.floor(startTime || new Date(), timezone);
    this.setState({
      activeMonthStartDate: flooredStart,
      selectionSet: true
    });
  }

  navigateToMonth(offset: number): void {
    const { timezone } = this.props;
    const { activeMonthStartDate } = this.state;
    const newDate = month.shift(activeMonthStartDate, timezone, offset);
    this.setState({
      activeMonthStartDate: newDate
    });
  }

  goToPreviousMonth(): void {
    return this.navigateToMonth(-1);
  }

  goToNextMonth(): void {
    return this.navigateToMonth(1);
  }

  calculateHoverTimeRange(mouseEnteredDay: Date) {
    const { startTime, endTime } = this.props;
    let hoverTimeRange: TimeRange = null;
    if (startTime && !endTime) {
      let start = startTime;
      let end = mouseEnteredDay;
      // if mousing over backwards, set end to old start time
      if (mouseEnteredDay < startTime) {
        start = mouseEnteredDay;
        end = startTime;
      }
      hoverTimeRange = new TimeRange({ start, end, bounds: "[]" });
    }

    this.setState({ hoverTimeRange });
  }

  onCalendarMouseLeave() {
    this.setState({ hoverTimeRange: null });
  }

  selectNewRange(startDate: Date, endDate?: Date) {
    const { onStartChange, onEndChange, timezone } = this.props;
    onStartChange(startDate);
    // real end points are exclusive so +1 full day to selection (which is floored) to get the real end point
    if (endDate) endDate = shiftOneDay(endDate, timezone);
    onEndChange(endDate);
  }

  selectDay(selection: Date): void {
    const { startTime } = this.props;
    const { selectionSet } = this.state;

    if (selectionSet) {
      this.setState({ hoverTimeRange: null, selectionSet: false });
      this.selectNewRange(selection, null);
    } else {
      const isDoubleClickSameDay = datesEqual(selection, startTime);
      const isBackwardSelection = selection < startTime;

      if (isDoubleClickSameDay) {
        this.selectNewRange(startTime, startTime);
      } else if (isBackwardSelection) {
        this.selectNewRange(selection, startTime);
      } else {
        this.selectNewRange(startTime, selection);
      }
      this.setState({ selectionSet: true });
    }
  }

  getIsSelectable(date: Date): boolean {
    const { hoverTimeRange, selectionSet } = this.state;
    let inHoverTimeRange = false;
    if (hoverTimeRange) {
      inHoverTimeRange = hoverTimeRange.contains(date);
    }
    return inHoverTimeRange && !selectionSet;
  }

  getIsSelectedEdgeEnd(isSingleDate: boolean, candidate: Date) {
    if (isSingleDate) return false;
    const { startTime, endTime, timezone } = this.props;
    const candidateEndPoint = shiftOneDay(candidate, timezone);
    return wallTimeInclusiveEndEqual(endTime, candidateEndPoint, timezone) && endTime > startTime;
  }

  renderDays(weeks: Date[][], monthStart: Date, isSingleDate: boolean): JSX.Element[] {
    const { startTime, endTime, maxTime, timezone } = this.props;
    const nextMonthStart = month.shift(monthStart, timezone, 1);

    return weeks.map((daysInWeek: Date[], row: number) => {
      return <div className="week" key={row}> {daysInWeek.map((dayDate: Date, column: number) => {
        const isPast = dayDate < monthStart;
        const isFuture = dayDate >= nextMonthStart;
        const isBeyondMaxRange = dayDate > maxTime;
        const isSelectedEdgeStart = datesEqual(dayDate, day.floor(startTime, timezone));
        const isSelectedEdgeEnd = this.getIsSelectedEdgeEnd(isSingleDate, dayDate);
        const className = classNames("day", "value",
          {
            "past": isPast,
            "future": isFuture,
            "beyond-max-range": isBeyondMaxRange,
            "selectable": this.getIsSelectable(dayDate),
            "selected": startTime < dayDate && dayDate < endTime,
            "selected-edge": isSelectedEdgeStart || isSelectedEdgeEnd
          });

        return <div
          className={className}
          key={column}
          onClick={this.selectDay.bind(this, dayDate)}
          onMouseEnter={this.calculateHoverTimeRange.bind(this, dayDate)}
        >{getWallTimeDay(dayDate, timezone)}</div>;
      })}</div>;
    });
  }

  renderCalendar(startDate: Date, isSingleDate: boolean): JSX.Element[] {
    const { timezone } = this.props;
    const weeks: Date[][] = monthToWeeks(startDate, timezone, getLocale());
    const firstWeek = weeks[0];
    const lastWeek = weeks[weeks.length - 1];
    const countPrepend = 7 - firstWeek.length;
    const countAppend = 7 - lastWeek.length;
    weeks[0] = prependDays(timezone, firstWeek, countPrepend);
    weeks[weeks.length - 1] = appendDays(timezone, lastWeek, countAppend);
    return this.renderDays(weeks, startDate, isSingleDate);
  }

  renderCalendarNav(startDate: Date): JSX.Element {
    const { timezone } = this.props;

    return <div className="calendar-nav">
      <div
        className="caret left"
        onClick={this.goToPreviousMonth.bind(this)}
      >
        <SvgIcon svg={require("../../icons/full-caret-left.svg")} />
      </div>
      {getWallTimeMonthWithYear(startDate, timezone)}
      <div
        className="caret right"
        onClick={this.goToNextMonth.bind(this)}
      >
        <SvgIcon svg={require("../../icons/full-caret-right.svg")} />
      </div>
    </div>;
  }

  render() {
    const { startTime, endTime, timezone, onStartChange, onEndChange } = this.props;
    const { activeMonthStartDate, selectionSet } = this.state;
    if (!activeMonthStartDate) return null;

    const isSingleDate = endTime ? getWallTimeDay(startTime, timezone) === getEndWallTimeInclusive(endTime, timezone).date() : true;
    return <div className="date-range-picker">
      <div>
        <DateRangeInput label="Start" type="start" time={startTime} timezone={timezone} onChange={onStartChange.bind(this)} />
        <DateRangeInput label="End" type="end" time={endTime} timezone={timezone} onChange={onEndChange.bind(this)} hide={!selectionSet} />
      </div>
      <div
        className="calendar"
        onMouseLeave={this.onCalendarMouseLeave.bind(this)}
      >
        {this.renderCalendarNav(activeMonthStartDate)}
        <div className="week">
          {getLocale().shortDays.map((day, i) => {
            return <div className="day label" key={day + i}><span className="space" />{day}</div>;
          })
          }
        </div>
        {this.renderCalendar(activeMonthStartDate, isSingleDate)}
      </div>
    </div>;
  }
}
