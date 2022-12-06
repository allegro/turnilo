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

import { expect } from "chai";
import { Timezone } from "chronoshift";
import { NumberRange, TimeRange } from "plywood";
import * as sinon from "sinon";
import { DimensionFixtures } from "../../models/dimension/dimension.fixtures";
import * as TimeModule from "../time/time";
import { formatFilterClause, formatSegment, formatShortSegment } from "./formatter";
import { FormatterFixtures } from "./formatter.fixtures";

describe("General", () => {
  describe("formatFilterClause", () => {
    const latestDurationTests = [
      { duration: "PT1H", label: "Latest hour" },
      { duration: "PT6H", label: "Latest 6 hours" },
      { duration: "P1D", label: "Latest day" },
      { duration: "P7D", label: "Latest 7 days" },
      { duration: "P30D", label: "Latest 30 days" }
    ];

    latestDurationTests.forEach(({ duration, label }) => {
      it(`formats latest ${duration} as "${label}"`, () => {
        const timeFilterLatest = FormatterFixtures.latestDuration(duration);
        expect(formatFilterClause(DimensionFixtures.time(), timeFilterLatest, Timezone.UTC)).to.equal(label);
      });
    });

    const durationTests = [
      { duration: "P1D", previousLabel: "Previous day", currentLabel: "Current day" },
      { duration: "P1W", previousLabel: "Previous week", currentLabel: "Current week" },
      { duration: "P1M", previousLabel: "Previous month", currentLabel: "Current month" },
      { duration: "P3M", previousLabel: "Previous quarter", currentLabel: "Current quarter" },
      { duration: "P1Y", previousLabel: "Previous year", currentLabel: "Current year" }
    ];

    durationTests.forEach(({ duration, previousLabel: label }) => {
      it(`formats previous ${duration} as "${label}"`, () => {
        const timeFilterPrevious = FormatterFixtures.previousDuration(duration);
        expect(formatFilterClause(DimensionFixtures.time(), timeFilterPrevious, Timezone.UTC)).to.equal(label);
      });
    });

    durationTests.forEach(({ duration, currentLabel: label }) => {
      it(`formats current ${duration} as "${label}"`, () => {
        const timeFilterCurrent = FormatterFixtures.currentDuration(duration);
        expect(formatFilterClause(DimensionFixtures.time(), timeFilterCurrent, Timezone.UTC)).to.equal(label);
      });
    });

    it("should use formatTimeRange for formatting range in FixedTimeFilter", () => {
      const formatTimeRange = sinon.spy(TimeModule, "formatTimeRange");
      const start = new Date("2016-11-11");
      const end = new Date("2016-12-01");
      const filterClause = FormatterFixtures.fixedTimeFilter(start, end);
      formatFilterClause(DimensionFixtures.time(), filterClause, Timezone.UTC);
      expect(formatTimeRange.calledWith({ start, end }, Timezone.UTC)).to.equal(true);
      formatTimeRange.restore();
    });

    it("formats number", () => {
      expect(formatFilterClause(DimensionFixtures.number(), FormatterFixtures.numberFilter(), Timezone.UTC)).to.equal("Numeric: 1 to 3");
    });

    it("formats string", () => {
      expect(
        formatFilterClause(DimensionFixtures.countryString(), FormatterFixtures.stringFilterShort(), Timezone.UTC)
      ).to.equal("important countries: iceland");
    });
  });

  describe("formatSegment", () => {
    it("should convert number to string", () => {
      expect(formatSegment(42, null)).to.be.equal("42");
    });

    it("should pass string as is", () => {
      expect(formatSegment("foobar", null)).to.be.equal("foobar");
    });

    it("should return whole number range as string", () => {
      expect(formatSegment(new NumberRange({
        start: 42,
        end: 120
      }), null)).to.be.equal("42 to 120");
    });

    it("should return start of time range as string", () => {
      expect(formatSegment(new TimeRange({
        start: new Date("2016-11-11"),
        end: new Date("2016-12-01")
      }), Timezone.UTC)).to.be.equal("11 Nov 2016");
    });
  });

  describe("formatShortSegment", () => {
    it("should convert number to string", () => {
      expect(formatShortSegment(42, null)).to.be.equal("42");
    });

    it("should pass string as is", () => {
      expect(formatShortSegment("foobar", null)).to.be.equal("foobar");
    });

    it("should return start of number range as string", () => {
      expect(formatShortSegment(new NumberRange({
        start: 42,
        end: 120
      }), null)).to.be.equal("42");
    });

    it("should return start of time range as string", () => {
      expect(formatShortSegment(new TimeRange({
        start: new Date("2016-11-11"),
        end: new Date("2016-12-01")
      }), Timezone.UTC)).to.be.equal("11 Nov 2016");
    });
  });
});
