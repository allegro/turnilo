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
import { Moment, tz } from "moment-timezone";

const ISO_FORMAT_DATE = "YYYY-MM-DD";
const ISO_FORMAT_TIME = "HH:mm";
const FORMAT_FULL_MONTH_WITH_YEAR = "MMMM YYYY";

function getMoment(date: Date, timezone: Timezone): Moment {
  return tz(date, timezone.toString());
}

export interface Locale {
  shortDays: string[];
  shortMonths: string[];
  weekStart: number;
}

const FULL_FORMAT = "D MMM YYYY H:mm";
const WITHOUT_YEAR_FORMAT = "D MMM H:mm";
const WITHOUT_HOUR_FORMAT = "D MMM YYYY";
const SHORT_FORMAT = "D MMM";

function getFormat(omitYear: boolean, omitHour: boolean): string {
  if (omitHour && omitYear) return SHORT_FORMAT;
  if (omitYear) return WITHOUT_YEAR_FORMAT;
  if (omitHour) return WITHOUT_HOUR_FORMAT;
  return FULL_FORMAT;
}

function isCurrentYear(year: number, timezone: Timezone): boolean {
  const nowWallTime = getMoment(new Date(), timezone);
  return nowWallTime.year() === year;
}

function isStartOfTheDay(date: Moment): boolean {
  return date.clone().startOf("day").isSame(date);
}

function isOneWholeDay(a: Moment, b: Moment): boolean {
  return isStartOfTheDay(a) && b.diff(a, "days") === 1;
}

export function formatTimeRange({ start, end }: { start: Date, end: Date }, timezone: Timezone): string {
  const startMoment = getMoment(start, timezone);
  const endMoment = getMoment(end, timezone);
  const omitYear = isCurrentYear(startMoment.year(), timezone) && isCurrentYear(endMoment.year(), timezone);
  const oneWholeDay = isOneWholeDay(startMoment, endMoment);
  if (oneWholeDay) {
    return startMoment.format(getFormat(omitYear, true));
  }
  const hasDayBoundaries = isStartOfTheDay(startMoment) && isStartOfTheDay(endMoment);
  if (hasDayBoundaries) {
    const format = getFormat(omitYear, true);
    return `${startMoment.format(format)} - ${endMoment.subtract(1, "day").format(format)}`;
  }
  const format = getFormat(omitYear, false);
  return `${startMoment.format(format)} - ${endMoment.format(format)}`;
}

// calendar utils

export function monthToWeeks(firstDayOfMonth: Date, timezone: Timezone, locale: Locale): Date[][] {
  const weeks: Date[][] = [];
  const firstDayNextMonth = month.shift(firstDayOfMonth, timezone, 1);

  let week: Date[] = [];
  let currentPointer = day.floor(firstDayOfMonth, timezone);
  while (currentPointer < firstDayNextMonth) {
    const wallTime = getMoment(currentPointer, timezone);
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

export function shiftOneDay(floored: Date, timezone: Timezone): Date {
  return day.shift(floored, timezone, 1);
}

export function endingDay(date: Date, timezone: Timezone): Date {
  const moment = getMoment(date, timezone);
  const start = moment.clone().startOf("day");
  if (moment.isSame(start)) return start.subtract(1, "day").toDate();
  return start.toDate();
}

export function datesEqual(d1: Date, d2: Date): boolean {
  if (!Boolean(d1) === Boolean(d2)) return false;
  if (d1 === d2) return true;
  return d1.valueOf() === d2.valueOf();
}

export function getDayInMonth(date: Date, timezone: Timezone): number {
  return getMoment(date, timezone).date();
}

export function formatYearMonth(date: Date, timezone: Timezone): string {
  return getMoment(date, timezone).format(FORMAT_FULL_MONTH_WITH_YEAR);
}

export function formatTimeElapsed(date: Date, timezone: Timezone): string {
  return getMoment(date, timezone).fromNow(true);
}

export function formatDateTime(date: Date, timezone: Timezone): string {
  return getMoment(date, timezone).format(FULL_FORMAT);
}

export function formatISODate(date: Date, timezone: Timezone): string {
  return getMoment(date, timezone).format(ISO_FORMAT_DATE);
}

export function formatISOTime(date: Date, timezone: Timezone): string {
  return getMoment(date, timezone).format(ISO_FORMAT_TIME);
}

export function trimISODate(date: string): string {
  return date.replace(/[^\d-]/g, "");
}

const ISO_DATE_TEST = /^\d\d\d\d-\d\d-\d\d$/;
export function validateISODate(date: string): boolean {
  return ISO_DATE_TEST.test(date);
}

export function trimISOTime(time: string): string {
  return time.replace(/[^\d:]/g, "");
}

const ISO_TIME_TEST = /^\d\d:\d\d$/;
export function validateISOTime(time: string): boolean {
  return ISO_TIME_TEST.test(time);
}

export function combineDateAndTimeIntoMoment(date: string, time: string, timezone: Timezone): Moment {
  return tz(`${date}T${time}`, timezone.toString());
}
