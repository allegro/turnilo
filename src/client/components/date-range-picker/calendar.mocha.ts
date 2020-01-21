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
import * as chaiDatetime from "chai-datetime";
import { Timezone } from "chronoshift";
import { tz } from "moment-timezone";
import { getLocale } from "../../config/constants";
import { calendarDays, monthToWeeks, nextNDates, previousNDates, shiftOneDay } from "./calendar";

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

const moment = (day: string, timezone: Timezone) => tz(day, timezone.toString());
const date = (day: string, timezone: Timezone) => moment(day, timezone).toDate();

describe("monthToWeeks", () => {

  describe("March 2010", () => {
    const march2010Weeks = (tz: Timezone) => [
      [date("2010-03-01", tz), date("2010-03-02", tz), date("2010-03-03", tz), date("2010-03-04", tz), date("2010-03-05", tz), date("2010-03-06", tz)],
      [date("2010-03-07", tz), date("2010-03-08", tz), date("2010-03-09", tz), date("2010-03-10", tz), date("2010-03-11", tz), date("2010-03-12", tz), date("2010-03-13", tz)],
      [date("2010-03-14", tz), date("2010-03-15", tz), date("2010-03-16", tz), date("2010-03-17", tz), date("2010-03-18", tz), date("2010-03-19", tz), date("2010-03-20", tz)],
      [date("2010-03-21", tz), date("2010-03-22", tz), date("2010-03-23", tz), date("2010-03-24", tz), date("2010-03-25", tz), date("2010-03-26", tz), date("2010-03-27", tz)],
      [date("2010-03-28", tz), date("2010-03-29", tz), date("2010-03-30", tz), date("2010-03-31", tz)]
    ];

    it("should calculate for UTC", () => {
      const timezone = Timezone.UTC;
      const firstMarch2010 = date("2010-03-01", timezone);
      assertEqualCalendarMatrix(monthToWeeks(firstMarch2010, timezone, getLocale()), march2010Weeks(timezone));
    });

    it("should calculate for Warsaw", () => {
      const timezone = Timezone.fromJS("Europe/Warsaw");
      const firstMarch2010 = date("2010-03-01", timezone);
      assertEqualCalendarMatrix(monthToWeeks(firstMarch2010, timezone, getLocale()), march2010Weeks(timezone));
    });
  });

  describe("October 2019 (summer time change)", () => {
    const october2019Weeks = (tz: Timezone) => [
      [date("2019-10-01", tz), date("2019-10-02", tz), date("2019-10-03", tz), date("2019-10-04", tz), date("2019-10-05", tz)],
      [date("2019-10-06", tz), date("2019-10-07", tz), date("2019-10-08", tz), date("2019-10-09", tz), date("2019-10-10", tz), date("2019-10-11", tz), date("2019-10-12", tz)],
      [date("2019-10-13", tz), date("2019-10-14", tz), date("2019-10-15", tz), date("2019-10-16", tz), date("2019-10-17", tz), date("2019-10-18", tz), date("2019-10-19", tz)],
      [date("2019-10-20", tz), date("2019-10-21", tz), date("2019-10-22", tz), date("2019-10-23", tz), date("2019-10-24", tz), date("2019-10-25", tz), date("2019-10-26", tz)],
      [date("2019-10-27", tz), date("2019-10-28", tz), date("2019-10-29", tz), date("2019-10-30", tz), date("2019-10-31", tz)]
    ];

    it("should calculate for UTC october (no summer time change)", () => {
      const timezone = Timezone.UTC;
      const firstOctober2019 = date("2019-10-01", timezone);
      assertEqualCalendarMatrix(monthToWeeks(firstOctober2019, timezone, getLocale()), october2019Weeks(timezone));
    });

    it("should calculate for Warsaw october (summer time change)", () => {
      const timezone = Timezone.fromJS("Europe/Warsaw");
      const firstOctober2019 = date("2019-10-01", timezone);
      assertEqualCalendarMatrix(monthToWeeks(firstOctober2019, timezone, getLocale()), october2019Weeks(timezone));
    });
  });
});

describe("calendarDays", () => {
  it("should calculate calendar for March UTC", () => {
    const utc = Timezone.UTC;
    const firstMarch2010 = date("2010-03-01", utc);
    assertEqualCalendarMatrix(calendarDays(firstMarch2010, utc, getLocale()), [
      [date("2010-02-28", utc), date("2010-03-01", utc), date("2010-03-02", utc), date("2010-03-03", utc), date("2010-03-04", utc), date("2010-03-05", utc), date("2010-03-06", utc)],
      [date("2010-03-07", utc), date("2010-03-08", utc), date("2010-03-09", utc), date("2010-03-10", utc), date("2010-03-11", utc), date("2010-03-12", utc), date("2010-03-13", utc)],
      [date("2010-03-14", utc), date("2010-03-15", utc), date("2010-03-16", utc), date("2010-03-17", utc), date("2010-03-18", utc), date("2010-03-19", utc), date("2010-03-20", utc)],
      [date("2010-03-21", utc), date("2010-03-22", utc), date("2010-03-23", utc), date("2010-03-24", utc), date("2010-03-25", utc), date("2010-03-26", utc), date("2010-03-27", utc)],
      [date("2010-03-28", utc), date("2010-03-29", utc), date("2010-03-30", utc), date("2010-03-31", utc), date("2010-04-01", utc), date("2010-04-02", utc), date("2010-04-03", utc)]
    ]);
  });
});

describe("shiftOneDay", () => {
  const utc = Timezone.UTC;
  const warsaw = Timezone.fromJS("Europe/Warsaw");

  it("shift by one day in UTC", () => {
    const start = moment("2010-01-03", utc);
    const expected = moment("2010-01-04", utc);
    expect(shiftOneDay(start).isSame(expected)).to.be.true;
  });

  it("shift by one day in Europe/Warsaw", () => {
    const start = moment("2010-01-03", warsaw);
    const expected = moment("2010-01-04", warsaw);
    expect(shiftOneDay(start).isSame(expected)).to.be.true;
  });

  it("shift by one day in Europe/Warsaw across DST forwards", () => {
    const start = moment("2019-10-26", warsaw);
    const expected = moment("2019-10-27", warsaw);
    expect(shiftOneDay(start).isSame(expected)).to.be.true;
  });

  it("shift by one day in Europe/Warsaw across DST forwards", () => {
    const start = moment("2019-10-27", warsaw);
    const expected = moment("2019-10-28", warsaw);
    expect(shiftOneDay(start).isSame(expected)).to.be.true;
  });

  it("shift by one day in Europe/Warsaw across DST backwards", () => {
    const start = moment("2010-03-30", warsaw);
    const expected = moment("2010-03-31", warsaw);
    expect(shiftOneDay(start).isSame(expected)).to.be.true;
  });

  it("shift by one day in Europe/Warsaw across DST backwards", () => {
    const start = moment("2010-03-31", warsaw);
    const expected = moment("2010-04-01", warsaw);
    expect(shiftOneDay(start).isSame(expected)).to.be.true;
  });
});

const dayInMarch1995 = (day: number) => new Date(Date.UTC(1995, 2, day));

it("previous N dates", () => {
  const prepended = previousNDates(dayInMarch1995(1), 5, Timezone.UTC);
  expect(prepended).to.deep.equal([
    new Date("1995-02-24T00:00:00.000Z"),
    new Date("1995-02-25T00:00:00.000Z"),
    new Date("1995-02-26T00:00:00.000Z"),
    new Date("1995-02-27T00:00:00.000Z"),
    new Date("1995-02-28T00:00:00.000Z")
  ]);
});

it("next N dates", () => {
  const append = nextNDates(dayInMarch1995(31), 5, Timezone.UTC);
  expect(append).to.deep.equal([
    new Date("1995-04-01T00:00:00.000Z"),
    new Date("1995-04-02T00:00:00.000Z"),
    new Date("1995-04-03T00:00:00.000Z"),
    new Date("1995-04-04T00:00:00.000Z"),
    new Date("1995-04-05T00:00:00.000Z")
  ]);
});
