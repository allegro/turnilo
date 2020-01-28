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
import { day, Timezone } from "chronoshift";
import { Moment } from "moment-timezone/moment-timezone";
import { range } from "../../../common/utils/functional/functional";
import { getMoment, Locale } from "../../../common/utils/time/time";

export function calendarDays(startDay: Date, timezone: Timezone, locale: Locale): Date[][] {
  const monthWeeks = monthToWeeks(startDay, timezone, locale);
  const firstWeek = monthWeeks[0];
  const lastWeek = monthWeeks[monthWeeks.length - 1];
  const middleWeeks = monthWeeks.slice(1, -1);
  return [
    padFirstWeek(firstWeek, timezone),
    ...middleWeeks,
    padLastWeek(lastWeek, timezone)
  ];
}

function padLastWeek(lastWeek: Date[], timezone: Timezone): Date[] {
  const lastDate = lastWeek[lastWeek.length - 1];
  const padCount = 7 - lastWeek.length;
  return [...lastWeek, ...nextNDates(lastDate, padCount, timezone)];
}

function padFirstWeek(firstWeek: Date[], timezone: Timezone): Date[] {
  const firstDate = firstWeek[0];
  const padCount = 7 - firstWeek.length;
  return [...previousNDates(firstDate, padCount, timezone), ...firstWeek];
}

export function monthToWeeks(startDay: Date, timezone: Timezone, locale: Locale): Date[][] {
  const weeks: Date[][] = [];
  const firstDayOfMonth = getMoment(startDay, timezone);
  const firstDayOfNextMonth = firstDayOfMonth.clone().add(1, "month");

  let week: Date[] = [];
  let currentPointer = firstDayOfMonth.clone().startOf("day");
  while (currentPointer.isBefore(firstDayOfNextMonth)) {
    if ((currentPointer.day() === locale.weekStart || 0) && week.length > 0) {
      weeks.push(week);
      week = [];
    }

    week.push(currentPointer.toDate());
    currentPointer = currentPointer.add(1, "day");
  }
  // push last week
  if (week.length > 0) weeks.push(week);
  return weeks;
}

export function previousNDates(start: Date, n: number, timezone: Timezone): Date[] {
  return range(0, n)
    .map(i => day.shift(start, timezone, -n + i));
}

export function nextNDates(start: Date, n: number, timezone: Timezone): Date[] {
  return range(0, n)
    .map(i => day.shift(start, timezone, i + 1));
}
