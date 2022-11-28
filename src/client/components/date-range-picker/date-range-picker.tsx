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

import { day, month, Timezone } from "chronoshift";
import { TimeRange } from "plywood";
import React from "react";
import { Locale } from "../../../common/models/locale/locale";
import { cyclicShift } from "../../../common/utils/functional/functional";
import { datesEqual, formatYearMonth, getDayInMonth } from "../../../common/utils/time/time";
import { classNames } from "../../utils/dom/dom";
import { DateRangeInput } from "../date-range-input/date-range-input";
import { SvgIcon } from "../svg-icon/svg-icon";
import { calendarDays } from "./calendar";
import "./date-range-picker.scss";

export interface DateRangePickerProps {
  startTime?: Date;
  endTime?: Date;
  maxTime?: Date;
  timezone: Timezone;
  onStartChange: (t: Date) => void;
  onEndChange: (t: Date) => void;
  locale: Locale;
}

export interface DateRangePickerState {
  activeMonthStartDate?: Date;
  hoverTimeRange?: TimeRange;
  selectionSet?: boolean;
}

export class DateRangePicker extends React.Component<DateRangePickerProps, DateRangePickerState> {

  state: DateRangePickerState = {
    activeMonthStartDate: month.floor(this.props.startTime || new Date(), this.props.timezone),
    hoverTimeRange: null,
    selectionSet: true
  };

  navigateToMonth(offset: number): void {
    const { timezone } = this.props;
    const { activeMonthStartDate } = this.state;
    const newDate = month.shift(activeMonthStartDate, timezone, offset);
    this.setState({
      activeMonthStartDate: newDate
    });
  }

  goToPreviousMonth = () => this.navigateToMonth(-1);

  goToNextMonth = () => this.navigateToMonth(1);

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

  onCalendarMouseLeave = () => {
    this.setState({ hoverTimeRange: null });
  };

  selectNewRange(startDate: Date, endDate?: Date) {
    const { onStartChange, onEndChange, timezone } = this.props;
    onStartChange(startDate);
    // real end points are exclusive so +1 full day to selection (which is floored) to get the real end point
    if (endDate) endDate = day.shift(endDate, timezone, 1);
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
    const inHoverTimeRange = hoverTimeRange && hoverTimeRange.contains(date);
    return inHoverTimeRange && !selectionSet;
  }

  renderDays(weeks: Date[][], monthStart: Date): JSX.Element[] {
    const { startTime, endTime, maxTime, timezone } = this.props;
    const startDay = day.floor(startTime, timezone);
    const dayBeforeEnd = endTime && day.shift(endTime, timezone, -1);
    const nextMonthStart = month.shift(monthStart, timezone, 1);

    return weeks.map((daysInWeek: Date[], row: number) => {
      return <div className="week" key={row}> {daysInWeek.map((dayDate: Date, column: number) => {
        const isPast = dayDate < monthStart;
        const isFuture = dayDate >= nextMonthStart;
        const isBeyondMaxRange = dayDate > maxTime;
        const isSelected = startDay <= dayDate && dayDate < endTime;
        const isSelectedEdgeStart = datesEqual(dayDate, startTime);
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
    const { timezone, locale } = this.props;
    const weeks: Date[][] = calendarDays(startDate, timezone, locale);
    return this.renderDays(weeks, startDate);
  }

  renderCalendarNav(startDate: Date): JSX.Element {
    const { timezone } = this.props;

    return <div className="calendar-nav">
      <div
        className="caret left"
        onClick={this.goToPreviousMonth}
      >
        <SvgIcon svg={require("../../icons/full-caret-left.svg")} />
      </div>
      {formatYearMonth(startDate, timezone)}
      <div
        className="caret right"
        onClick={this.goToNextMonth}
      >
        <SvgIcon svg={require("../../icons/full-caret-right.svg")} />
      </div>
    </div>;
  }

  render() {
    const { locale, startTime, endTime, timezone, onStartChange, onEndChange } = this.props;
    const { activeMonthStartDate, selectionSet } = this.state;
    if (!activeMonthStartDate) return null;

    const days = cyclicShift(locale.shortDays, locale.weekStart);
    return <div className="date-range-picker">
      <div>
        <DateRangeInput label="Start" type="start" time={startTime} timezone={timezone} onChange={onStartChange} />
        <DateRangeInput label="End" type="end" time={endTime} timezone={timezone} onChange={onEndChange} hide={!selectionSet} />
      </div>
      <div
        className="calendar"
        onMouseLeave={this.onCalendarMouseLeave}
      >
        {this.renderCalendarNav(activeMonthStartDate)}
        <div className="week">
          {days.map((day, i) => {
            return <div className="day label" key={day + i}><span className="space" />{day}</div>;
          })
          }
        </div>
        {this.renderCalendar(activeMonthStartDate)}
      </div>
    </div>;
  }
}
