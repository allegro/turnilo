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

import { Timezone } from "chronoshift";
import * as d3 from "d3";
import { Moment, tz } from "moment-timezone";
import { Unary } from "../functional/functional";

const ISO_FORMAT_DATE = "YYYY-MM-DD";
const ISO_FORMAT_TIME = "HH:mm";
const ISO_FORMAT_DATE_TIME = "YYYY-MM-DDTHH:mm:ss.sssZ";
const FORMAT_FULL_MONTH_WITH_YEAR = "MMMM YYYY";

const URL_SAFE_FULL_FORMAT = "YYYY-MM-DD-HH-mm";

export function getMoment(date: Date, timezone: Timezone): Moment {
  return tz(date, timezone.toString());
}

const FULL_FORMAT = "D MMM YYYY H:mm";
const WITHOUT_YEAR_FORMAT = "D MMM H:mm";
const WITHOUT_HOUR_FORMAT = "D MMM YYYY";
const WITHOUT_YEAR_AND_HOUR_FORMAT = "D MMM";

const SHORT_WITHOUT_HOUR_FORMAT = "D MMM YY";
const SHORT_FULL_FORMAT = "D MMM YY H:mm";
const SHORT_WITHOUT_YEAR_FORMAT = "D MMM H:mm";
const SHORT_WITHOUT_YEAR_AND_HOUR_FORMAT = "D MMM";
const SHORT_WITHOUT_YEAR_AND_DATE_FORMAT = "H:mm";
const SHORT_WITHOUT_DATE_AND_HOUR_FORMAT = "YYYY";

function formatterFromDefinition(definition: string): Unary<Moment, string> {
  return (date: Moment) => date.format(definition);
}

function getShortFormat(sameYear: boolean, sameDate: boolean, sameHour: boolean): string {
  if (sameYear && sameDate && !sameHour) return SHORT_WITHOUT_YEAR_AND_DATE_FORMAT;
  if (!sameYear && sameDate && sameHour) return SHORT_WITHOUT_DATE_AND_HOUR_FORMAT;
  if (sameYear && !sameDate && sameHour) return SHORT_WITHOUT_YEAR_AND_HOUR_FORMAT;
  if (sameYear && !sameDate && !sameHour) return SHORT_WITHOUT_YEAR_FORMAT;
  if (!sameYear && sameHour) return SHORT_WITHOUT_HOUR_FORMAT;
  return SHORT_FULL_FORMAT;
}

function hasSameHour(a: Date, b: Date): boolean {
  return a.getHours() === b.getHours() && a.getMinutes() === b.getMinutes();
}

function hasSameDateAndMonth(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth();
}

export function scaleTicksFormat(scale: d3.ScaleTime<number, number>): string {
  const ticks = scale.ticks();
  if (ticks.length < 2) return SHORT_FULL_FORMAT;
  const [first, ...rest] = ticks;
  const sameYear = rest.every(date => date.getFullYear() === first.getFullYear());
  const sameDayAndMonth = rest.every(date => hasSameDateAndMonth(date, first));
  const sameHour = rest.every(date => hasSameHour(date, first));
  return getShortFormat(sameYear, sameDayAndMonth, sameHour);
}

export function scaleTicksFormatter(scale: d3.ScaleTime<number, number>): Unary<Moment, string> {
  return formatterFromDefinition(scaleTicksFormat(scale));
}

function getLongFormat(omitYear: boolean, omitHour: boolean): string {
  if (omitHour && omitYear) return WITHOUT_YEAR_AND_HOUR_FORMAT;
  if (omitYear) return WITHOUT_YEAR_FORMAT;
  if (omitHour) return WITHOUT_HOUR_FORMAT;
  return FULL_FORMAT;
}

function isCurrentYear(moment: Moment, timezone: Timezone): boolean {
  const nowWallTime = getMoment(new Date(), timezone);
  return nowWallTime.year() === moment.year();
}

function isStartOfTheDay(date: Moment): boolean {
  return date.milliseconds() === 0
    && date.seconds() === 0
    && date.minutes() === 0
    && date.hours() === 0;
}

function isOneWholeDay(a: Moment, b: Moment): boolean {
  return isStartOfTheDay(a) && isStartOfTheDay(b) && b.diff(a, "days") === 1;
}

function formatOneWholeDay(day: Moment, timezone: Timezone): string {
  const omitYear = isCurrentYear(day, timezone);
  return day.format(getLongFormat(omitYear, true));
}

function formatDaysRange(start: Moment, end: Moment, timezone: Timezone): [string, string] {
  const dayBeforeEnd = end.subtract(1, "day");
  const omitYear = isCurrentYear(start, timezone) && isCurrentYear(dayBeforeEnd, timezone);
  const format = getLongFormat(omitYear, true);
  return [start.format(format), dayBeforeEnd.format(format)];
}

function formatHoursRange(start: Moment, end: Moment, timezone: Timezone): [string, string] {
  const omitYear = isCurrentYear(start, timezone) && isCurrentYear(end, timezone);
  const format = getLongFormat(omitYear, false);
  return [start.format(format), end.format(format)];
}

export function formatDatesInTimeRange({ start, end }: { start: Date, end: Date }, timezone: Timezone): [string, string?] {
  const startMoment = getMoment(start, timezone);
  const endMoment = getMoment(end, timezone);

  if (isOneWholeDay(startMoment, endMoment)) {
    return [formatOneWholeDay(startMoment, timezone)];
  }
  const hasDayBoundaries = isStartOfTheDay(startMoment) && isStartOfTheDay(endMoment);
  if (hasDayBoundaries) {
    return formatDaysRange(startMoment, endMoment, timezone);
  }
  return formatHoursRange(startMoment, endMoment, timezone);
}

export function formatStartOfTimeRange(range: { start: Date, end: Date }, timezone: Timezone): string {
  return formatDatesInTimeRange(range, timezone)[0];
}

export function formatTimeRange(range: { start: Date, end: Date }, timezone: Timezone): string {
  return formatDatesInTimeRange(range, timezone).join(" - ");
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

export function formatISODateTime(date: Date, timezone: Timezone): string {
  return getMoment(date, timezone).format(ISO_FORMAT_DATE_TIME);
}

export function formatUrlSafeDateTime(date: Date, timezone: Timezone): string {
  return getMoment(date, timezone).format(URL_SAFE_FULL_FORMAT);
}

export function formatISODate(date: Date, timezone: Timezone): string {
  return getMoment(date, timezone).format(ISO_FORMAT_DATE);
}

export function formatISOTime(date: Date, timezone: Timezone): string {
  return getMoment(date, timezone).format(ISO_FORMAT_TIME);
}

const ISO_DATE_DISALLOWED = /[^\d-]/g;

export function normalizeISODate(date: string): string {
  return date.replace(ISO_DATE_DISALLOWED, "");
}

const ISO_DATE_TEST = /^\d\d\d\d-\d\d-\d\d$/;

export function validateISODate(date: string): boolean {
  return ISO_DATE_TEST.test(date);
}

const ISO_TIME_DISALLOWED = /[^\d:]/g;

export function normalizeISOTime(time: string): string {
  return time.replace(ISO_TIME_DISALLOWED, "");
}

const ISO_TIME_TEST = /^\d\d:\d\d$/;

export function validateISOTime(time: string): boolean {
  return ISO_TIME_TEST.test(time);
}

export function combineDateAndTimeIntoMoment(date: string, time: string, timezone: Timezone): Moment {
  return tz(`${date}T${time}`, timezone.toString());
}

export function isoNow(): string {
  return (new Date()).toISOString();
}
