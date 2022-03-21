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
import { expect, use } from "chai";
import chaiDatetime from "chai-datetime";
import { Timezone } from "chronoshift";
import { tz as getMomentWithTimezone } from "moment-timezone";
import { LOCALES } from "../../../common/models/locale/locale";
import { calendarDays, monthToWeeks, nextNDates, previousNDates } from "./calendar";

use(chaiDatetime);

function assertEqualCalendarMatrix(a: Date[][], b: Date[][]) {
  try {
    expect(a.length).equal(b.length);
    a.forEach((aWeek, i) => {
      const bWeek = b[i];
      expect(aWeek.length).equal(bWeek.length);
      aWeek.forEach((aDay, i) => {
        const bDay = bWeek[i];
        expect(aDay).equalDate(bDay);
      });
    });
  } catch {
    expect(a).to.be.deep.equal(b);
  }
}

const utc = Timezone.UTC;
const en_us = LOCALES["en-US"];
const warsawTZ = Timezone.fromJS("Europe/Warsaw");

const getDateInTimezone = (day: string, timezone: Timezone) => getMomentWithTimezone(day, timezone.toString()).toDate();

const convertDatesToTimezone = (dates: string[][], timezone: Timezone) =>
  dates.map(week => week.map(day => getDateInTimezone(day, timezone)));

describe("monthToWeeks", () => {
  describe("March 2010 (summer time change forward)", () => {
    const march2010Weeks = [
      ["2010-03-01", "2010-03-02", "2010-03-03", "2010-03-04", "2010-03-05", "2010-03-06"],
      ["2010-03-07", "2010-03-08", "2010-03-09", "2010-03-10", "2010-03-11", "2010-03-12", "2010-03-13"],
      ["2010-03-14", "2010-03-15", "2010-03-16", "2010-03-17", "2010-03-18", "2010-03-19", "2010-03-20"],
      ["2010-03-21", "2010-03-22", "2010-03-23", "2010-03-24", "2010-03-25", "2010-03-26", "2010-03-27"],
      ["2010-03-28", "2010-03-29", "2010-03-30", "2010-03-31"]
    ];

    it("should calculate for UTC (no DST)", () => {
      const firstMarch2010 = getDateInTimezone("2010-03-01", utc);
      const utcMarch2010 = convertDatesToTimezone(march2010Weeks, utc);
      assertEqualCalendarMatrix(monthToWeeks(firstMarch2010, utc, en_us), utcMarch2010);
    });

    it("should calculate for Warsaw (DST)", () => {
      const firstMarch2010 = getDateInTimezone("2010-03-01", warsawTZ);
      const warsawMarch2010 = convertDatesToTimezone(march2010Weeks, warsawTZ);
      assertEqualCalendarMatrix(monthToWeeks(firstMarch2010, warsawTZ, en_us), warsawMarch2010);
    });
  });

  describe("October 2019 (summer time change backward)", () => {
    const october2019Weeks = [
      ["2019-10-01", "2019-10-02", "2019-10-03", "2019-10-04", "2019-10-05"],
      ["2019-10-06", "2019-10-07", "2019-10-08", "2019-10-09", "2019-10-10", "2019-10-11", "2019-10-12"],
      ["2019-10-13", "2019-10-14", "2019-10-15", "2019-10-16", "2019-10-17", "2019-10-18", "2019-10-19"],
      ["2019-10-20", "2019-10-21", "2019-10-22", "2019-10-23", "2019-10-24", "2019-10-25", "2019-10-26"],
      ["2019-10-27", "2019-10-28", "2019-10-29", "2019-10-30", "2019-10-31"]
    ];

    it("should calculate for UTC october (no DST)", () => {
      const firstOctober2019 = getDateInTimezone("2019-10-01", utc);
      const utcOctober2019 = convertDatesToTimezone(october2019Weeks, utc);
      assertEqualCalendarMatrix(monthToWeeks(firstOctober2019, utc, en_us), utcOctober2019);
    });

    it("should calculate for Warsaw october (DST)", () => {
      const firstOctober2019 = getDateInTimezone("2019-10-01", warsawTZ);
      const warsawOctober2019 = convertDatesToTimezone(october2019Weeks, warsawTZ);
      assertEqualCalendarMatrix(monthToWeeks(firstOctober2019, warsawTZ, en_us), warsawOctober2019);
    });
  });
});

describe("calendarDays", () => {
  it("should calculate calendar for March UTC", () => {
    const firstMarch2010 = getDateInTimezone("2010-03-01", utc);
    const march2010 = [
      ["2010-02-28", "2010-03-01", "2010-03-02", "2010-03-03", "2010-03-04", "2010-03-05", "2010-03-06"],
      ["2010-03-07", "2010-03-08", "2010-03-09", "2010-03-10", "2010-03-11", "2010-03-12", "2010-03-13"],
      ["2010-03-14", "2010-03-15", "2010-03-16", "2010-03-17", "2010-03-18", "2010-03-19", "2010-03-20"],
      ["2010-03-21", "2010-03-22", "2010-03-23", "2010-03-24", "2010-03-25", "2010-03-26", "2010-03-27"],
      ["2010-03-28", "2010-03-29", "2010-03-30", "2010-03-31", "2010-04-01", "2010-04-02", "2010-04-03"]
    ];
    const utcMarch2010CalendarPage = convertDatesToTimezone(march2010, utc);
    assertEqualCalendarMatrix(calendarDays(firstMarch2010, utc, en_us), utcMarch2010CalendarPage);
  });
});

it("previous N dates", () => {
  const prepended = previousNDates(getDateInTimezone("1995-03-01", utc), 5, utc);
  expect(prepended).to.deep.equal([
    new Date("1995-02-24T00:00:00.000Z"),
    new Date("1995-02-25T00:00:00.000Z"),
    new Date("1995-02-26T00:00:00.000Z"),
    new Date("1995-02-27T00:00:00.000Z"),
    new Date("1995-02-28T00:00:00.000Z")
  ]);
});

it("next N dates", () => {
  const append = nextNDates(getDateInTimezone("1995-03-31", utc), 5, utc);
  expect(append).to.deep.equal([
    new Date("1995-04-01T00:00:00.000Z"),
    new Date("1995-04-02T00:00:00.000Z"),
    new Date("1995-04-03T00:00:00.000Z"),
    new Date("1995-04-04T00:00:00.000Z"),
    new Date("1995-04-05T00:00:00.000Z")
  ]);
});
