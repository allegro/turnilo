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

import { day, Duration, month, Timezone } from "chronoshift";
import { Moment } from "moment";
import * as moment from "moment-timezone";
import { TimeRange } from "plywood";

const FORMAT_ISO_WITHOUT_TIMEZONE = "YYYY-MM-DD[T]HH:mm:ss";
const FORMAT_DATE = "YYYY-MM-DD";
const FORMAT_TIME = "HH:mm";

const FORMAT_WITH_YEAR = "MMM D, YYYY";
const FORMAT_WITHOUT_YEAR = "MMM D";

const FORMAT_TIME_OF_DAY_WITH_MINUTES = "HH:mm";

const FORMAT_FULL_MONTH_WITH_YEAR = "MMMM YYYY";

export interface Locale {
  shortDays: string[];
  shortMonths: string[];
  weekStart: number;
}

export enum DisplayYear {
  ALWAYS, NEVER, IF_DIFF
}

export function getEndWallTimeInclusive(exclusiveEnd: Date, timezone: Timezone): Moment {
  return moment.tz(exclusiveToInclusiveEnd(exclusiveEnd), timezone.toString());
}

export function exclusiveToInclusiveEnd(exclusiveEnd: Date): Date {
  return new Date(exclusiveEnd.valueOf() - 1);
}

function formatDate(start: Moment, end: Moment, showingYear: boolean): string {
  if (start.year() !== end.year()) {
    return [start.format(FORMAT_WITH_YEAR), end.format(FORMAT_WITH_YEAR)].join(" - ");
  }
  const fmt = showingYear ? FORMAT_WITH_YEAR : FORMAT_WITHOUT_YEAR;
  if (start.month() !== end.month() || start.date() !== end.date()) {
    return [start.format(FORMAT_WITHOUT_YEAR), end.format(fmt)].join(" - ");
  }
  return start.format(fmt);
}

function formatTime(start: Moment, end: Moment): string {
  if (!start.hour() && !end.hour() && !start.minute() && !end.minute()) return null;
  return `${start.format(FORMAT_TIME_OF_DAY_WITH_MINUTES)} - ${end.format(FORMAT_TIME_OF_DAY_WITH_MINUTES)}`;
}

function showYear(displayYear: DisplayYear, startYear: number, endYear: number): boolean {
  switch (displayYear) {
    case DisplayYear.NEVER:
      return false;
    case DisplayYear.ALWAYS:
      return true;
    case DisplayYear.IF_DIFF:
      return startYear !== endYear || endYear !== moment().year();
  }
}

export function formatTimeRange(range: TimeRange, timezone: Timezone, displayYear: DisplayYear): string {
  const start = moment.tz(range.start, timezone.toString());
  const end = moment.tz(range.end, timezone.toString());
  const endInclusive = getEndWallTimeInclusive(range.end, timezone);

  const showingYear = showYear(displayYear, start.year(), end.year());
  const date = formatDate(start, endInclusive, showingYear);
  const time = formatTime(start, end);

  if (!time) return date;
  return `${date}${showingYear ? " " : ", "}${time}`;
}

// calendar utils

export function monthToWeeks(firstDayOfMonth: Date, timezone: Timezone, locale: Locale): Date[][] {
  const weeks: Date[][] = [];
  const firstDayNextMonth = month.shift(firstDayOfMonth, timezone, 1);

  let week: Date[] = [];
  let currentPointer = day.floor(firstDayOfMonth, timezone);
  while (currentPointer < firstDayNextMonth) {
    const wallTime = moment.tz(currentPointer, timezone.toString());
    if ((wallTime.day() === locale.weekStart || 0) && week.length > 0) {
      weeks.push(week);
      week = [];
    }

    week.push(currentPointer);
    currentPointer = day.shift(currentPointer, timezone, 1);
  }
  // push last week
  if (week.length > 0) weeks.push(week);
  return weeks;
}

export function prependDays(timezone: Timezone, weekPrependTo: Date[], countPrepend: number): Date[] {
  for (let i = 0; i < countPrepend; i++) {
    const firstDate = weekPrependTo[0];
    const shiftedDate = day.shift(firstDate, timezone, -1);
    weekPrependTo.unshift(shiftedDate);
  }
  return weekPrependTo;
}

export function appendDays(timezone: Timezone, weekAppendTo: Date[], countAppend: number): Date[] {
  for (let i = 0; i < countAppend; i++) {
    const lastDate = weekAppendTo[weekAppendTo.length - 1];
    const shiftedDate = day.shift(lastDate, timezone, 1);
    weekAppendTo.push(shiftedDate);
  }
  return weekAppendTo;
}

export function shiftOneDay(floored: Date, timezone: Timezone) {
  return day.shift(floored, timezone, 1);
}

export function datesEqual(d1: Date, d2: Date): boolean {
  if (!Boolean(d1) === Boolean(d2)) return false;
  if (d1 === d2) return true;
  return d1.valueOf() === d2.valueOf();
}

export function getWallTimeDay(date: Date, timezone: Timezone) {
  return moment.tz(date, timezone.toString()).date();
}

export function getWallTimeMonthWithYear(date: Date, timezone: Timezone) {
  return moment.tz(date, timezone.toString()).format(FORMAT_FULL_MONTH_WITH_YEAR);
}

export function wallTimeInclusiveEndEqual(d1: Date, d2: Date, timezone: Timezone): boolean {
  if (!Boolean(d1) === Boolean(d2)) return false;
  if (d1 === d2) return true;
  const d1InclusiveEnd = getEndWallTimeInclusive(d1, timezone);
  const d2InclusiveEnd = getEndWallTimeInclusive(d2, timezone);
  return datesEqual(d1InclusiveEnd.toDate(), d2InclusiveEnd.toDate());
}

export function getWallTimeString(date: Date, timezone: Timezone): string {
  const wallTimeISOString = moment.tz(date, timezone.toString()).format(FORMAT_ISO_WITHOUT_TIMEZONE);
  return wallTimeISOString.replace("T", ", ");
}

export function getWallTimeDateOnlyString(date: Date, timezone: Timezone): string {
  return moment.tz(date, timezone.toString()).format(FORMAT_DATE);
}

export function getWallTimeTimeOnlyString(date: Date, timezone: Timezone): string {
  return moment.tz(date, timezone.toString()).format(FORMAT_TIME);
}

/**
 * @deprecated
 * Currently only used in Pinned Dimension view for Time kind. We don't plan to support them.
 * @param range
 * @param granularity
 * @param timezone
 */
export function formatTimeBasedOnGranularity(range: TimeRange, granularity: Duration, timezone: Timezone): string {
  const startMoment = moment.tz(range.start, timezone.toString());

  const span = granularity.getSingleSpan();
  switch (span) {
    case "second":
      return startMoment.format("MMM D, HH:mm:ss");
    case "minute":
      return startMoment.format("MMM D, HH:mm");
    case "hour":
      return startMoment.format("MMM D, YYYY, HH:mm");
    case "day":
    case "week":
      return startMoment.format("MMM D, YYYY");
    case "month":
      return startMoment.format("MMM, YYYY");
    default:
      return startMoment.format(FORMAT_ISO_WITHOUT_TIMEZONE);
  }
}

export function formatGranularity(granularity: string): string {
  return granularity.replace(/^PT?/, "");
}

export function maybeFullyDefinedDate(date: string): boolean {
  return date.length === FORMAT_DATE.length;
}

export function maybeFullyDefinedTime(time: string): boolean {
  return time.length === FORMAT_TIME.length;
}

export function combineDateAndTimeIntoMoment(date: string, time: string, timezone: Timezone): moment.Moment {
  const fullDateTimeString = date + "T" + time;
  return moment.tz(fullDateTimeString, timezone.toString());
}
