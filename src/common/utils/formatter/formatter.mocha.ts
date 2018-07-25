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

import { expect } from "chai";
import { Timezone } from "chronoshift";
import { $ } from "plywood";
import { FilterClause } from "../../models/filter-clause/filter-clause";
import { DimensionFixtures } from "../../models/fixtures";
import { formatFilterClause, formatterFromData, getMiddleNumber } from "./formatter";
import { FormatterFixtures } from "./formatter.fixtures";

describe("General", () => {
  describe("getMiddleNumber", () => {
    it("works in simple case", () => {
      var values = [100, 10, 1, 0];
      expect(getMiddleNumber(values)).to.equal(10);
    });

    it("works in more complex case", () => {
      var values = [0, 0, -1000, -100, 10, 1, 0, 0, 0, 0];
      expect(getMiddleNumber(values)).to.equal(10);
    });
  });

  describe("formatterFromData", () => {
    it("works in simple case", () => {
      var values = [100, 10, 1, 0];
      var formatter = formatterFromData(values, "0,0 a");
      expect(formatter(10)).to.equal("10");
    });

    it("works in k case", () => {
      var values = [50000, 5000, 5000, 5000, 5000, 100, 10, 1, 0];
      var formatter = formatterFromData(values, "0,0.000 a");
      expect(formatter(10)).to.equal("0.010 k");
      expect(formatter(12345)).to.equal("12.345 k");
    });

    it("works in KB case", () => {
      var values = [50000, 5000, 5000, 5000, 5000, 100, 10, 1, 0];
      var formatter = formatterFromData(values, "0,0.000 b");
      expect(formatter(10)).to.equal("0.010 KB");
      expect(formatter(12345)).to.equal("12.056 KB");
    });
  });

  describe("formatFilterClause", () => {
    const $now = $(FilterClause.NOW_REF_NAME);
    const $max = $(FilterClause.MAX_TIME_REF_NAME);

    const latestDurationTests = [
      { duration: "PT1H", step: -1, label: "Latest hour" },
      { duration: "PT1H", step: -6, label: "Latest 6 hours" },
      { duration: "P1D", step: -1, label: "Latest day" },
      { duration: "P1D", step: -7, label: "Latest 7 days" },
      { duration: "P1D", step: -30, label: "Latest 30 days" }
    ];

    latestDurationTests.forEach(({ duration, step, label }) => {
      it(`formats previous ${-step} * ${duration} as "${label}"`, () => {
        const timeFilterLatest = FormatterFixtures.latestDuration(duration, step);
        expect(formatFilterClause(DimensionFixtures.time(), timeFilterLatest, Timezone.UTC)).to.equal(label);
      });
    });

    const unsupportedLatestDurationTests = [
      { reference: $now, duration: "P1D", step: -2 },
      { reference: $max, duration: "PT1H", step: 0 },
      { reference: $max, duration: "P1D", step: 1 }
    ];

    unsupportedLatestDurationTests.forEach(({ reference, duration, step }) => {
      it(`throws on formatting latest ${-step} * ${duration} with ${reference} reference"`, () => {
        const timeFilterLatest = FormatterFixtures.timeRangeDuration(reference, duration, step);
        expect(() => formatFilterClause(DimensionFixtures.time(), timeFilterLatest, Timezone.UTC)).to.throw();
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

    const unsupportedPreviousDurationTests = [
      { reference: $now, duration: "P1D", step: -2 },
      { reference: $now, duration: "P1M", step: 2 }
    ];

    unsupportedPreviousDurationTests.forEach(({ reference, duration, step }) => {
      it(`throws on formatting previous ${-step} * ${duration} with ${reference} reference"`, () => {
        const timeFilterEarlier = FormatterFixtures.flooredDuration(reference, duration, step);
        expect(() => formatFilterClause(DimensionFixtures.time(), timeFilterEarlier, Timezone.UTC)).to.throw();
      });
    });

    const unsupportedCurrentDurationTests = [
      { reference: $max, duration: "P1D" },
      { reference: $max, duration: "P1W" },
      { reference: $max, duration: "P1M" }
    ];

    unsupportedCurrentDurationTests.forEach(({ reference, duration }) => {
      it(`throws on formatting current ${duration} with ${reference} reference"`, () => {
        const timeFilterCurrent = FormatterFixtures.flooredDuration(reference, duration, 1);
        expect(() => formatFilterClause(DimensionFixtures.time(), timeFilterCurrent, Timezone.UTC)).to.throw();
      });
    });

    const fixedTimeTests = [
      { start: "2016-11-11", end: "2016-12-12", label: "Nov 11 - Dec 11, 2016" },
      { start: "2015-11-11", end: "2016-12-12", label: "Nov 11, 2015 - Dec 11, 2016" },
      { start: "2015-11-11", end: "2015-11-14", label: "Nov 11 - Nov 13, 2015" }
    ];

    fixedTimeTests.forEach(({ start, end, label }) => {
      it(`formats [${start}, ${end}) as "${label}"`, () => {
        const filterClause = FormatterFixtures.fixedTimeFilter(new Date(start), new Date(end));
        expect(formatFilterClause(DimensionFixtures.time(), filterClause, Timezone.UTC)).to.equal(label);
      });
    });

    fixedTimeTests.forEach(({ start, end, label }) => {
      it(`formats range [${start}, ${end}) as "time: ${label}"`, () => {
        const filterClause = FormatterFixtures.fixedTimeFilter(new Date(start), new Date(end));
        expect(formatFilterClause(DimensionFixtures.time(), filterClause, Timezone.UTC, true)).to.equal(`time: ${label}`);
      });
    });

    it("formats number", () => {
      expect(formatFilterClause(DimensionFixtures.number(), FormatterFixtures.numberFilter(), Timezone.UTC)).to.equal("Numeric (3)");
    });

    it("formats number verbose", () => {
      expect(formatFilterClause(DimensionFixtures.number(), FormatterFixtures.numberFilter(), Timezone.UTC, true)).to.equal("Numeric: 1, 2, 3");
    });

    it("formats string", () => {
      expect(
        formatFilterClause(DimensionFixtures.countryString(), FormatterFixtures.stringFilterShort(), Timezone.UTC)
      ).to.equal("important countries: iceland");
    });

    it("formats string verbose", () => {
      expect(
        formatFilterClause(DimensionFixtures.countryString(), FormatterFixtures.stringFilterShort(), Timezone.UTC, true)
      ).to.equal("important countries: iceland");
    });
  });
});
