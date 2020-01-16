/*
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

import { expect, use } from "chai";
import { Duration, Timezone } from "chronoshift";
import { List } from "immutable";
import { testImmutableClass } from "immutable-class-tester";
import equivalent from "../../../client/utils/test-utils/equivalent";

import { DateRange } from "../date-range/date-range";
import { FixedTimeFilterClause, RelativeTimeFilterClause, TimeFilterPeriod } from "../filter-clause/filter-clause";
import { isValidTimeShift, TimeShift } from "./time-shift";

use(equivalent);

describe("TimeShift", () => {
  it("is an immutable class", () => {
    testImmutableClass(TimeShift, [null, "P1D"]);
  });
});

describe("isValidTimeShift", () => {
  it("should return false for invalid timeshifts", () => {
    expect(isValidTimeShift(""), "empty string").to.be.false;
    expect(isValidTimeShift("1234"), "number").to.be.false;
    expect(isValidTimeShift("1D"), "duration without leading P").to.be.false;
    expect(isValidTimeShift("P1H"), "hour duration without T").to.be.false;
  });

  it("should return true for valid timeshifts", () => {
    expect(isValidTimeShift(null), "<null>").to.be.true;
    expect(isValidTimeShift("PT1H"), "one hour").to.be.true;
    expect(isValidTimeShift("P2D"), "two days").to.be.true;
    expect(isValidTimeShift("P3W"), "three weeks").to.be.true;
    expect(isValidTimeShift("P2M"), "two months").to.be.true;
    expect(isValidTimeShift("P5Y"), "five years").to.be.true;
  });

  describe("constrainToFilter", () => {

    const oneDay = TimeShift.fromJS("P1D");
    const empty = TimeShift.empty();

    describe("Fixed time filter", () => {
      it("does not touch if shifted period do not overlap with original", () => {
        const filter = new FixedTimeFilterClause({
          reference: "time",
          values: List.of(new DateRange({
            start: new Date("2010-01-01"),
            end: new Date("2010-01-02")
          }))
        });
        expect(oneDay.constrainToFilter(filter, Timezone.UTC)).to.be.equivalent(oneDay);
      });

      it("returns empty time shift if shifted period overlap with original", () => {
        const filter = new FixedTimeFilterClause({
          reference: "time",
          values: List.of(new DateRange({
            start: new Date("2010-01-01"),
            end: new Date("2010-01-03")
          }))
        });
        expect(oneDay.constrainToFilter(filter, Timezone.UTC)).to.be.equivalent(empty);
      });
    });

    describe("Relative time filter", () => {
      describe("Latest period", () => {
        it("does not touch if shifted period do not overlap with original", () => {
          const filter = new RelativeTimeFilterClause({
            reference: "time",
            period: TimeFilterPeriod.LATEST,
            duration: Duration.fromJS("P1D")
          });
          expect(oneDay.constrainToFilter(filter, Timezone.UTC)).to.be.equivalent(oneDay);
        });

        it("returns empty time shift if shifted period overlap with original", () => {
          const filter = new RelativeTimeFilterClause({
            reference: "time",
            period: TimeFilterPeriod.LATEST,
            duration: Duration.fromJS("P2D")
          });
          expect(oneDay.constrainToFilter(filter, Timezone.UTC)).to.be.equivalent(empty);
        });
      });

      describe("Previous period", () => {
        it("does not touch if shifted period do not overlap with original", () => {
          const filter = new RelativeTimeFilterClause({
            reference: "time",
            period: TimeFilterPeriod.PREVIOUS,
            duration: Duration.fromJS("P1D")
          });
          expect(oneDay.constrainToFilter(filter, Timezone.UTC)).to.be.equivalent(oneDay);
        });

        it("returns empty time shift if shifted period overlap with original", () => {
          const filter = new RelativeTimeFilterClause({
            reference: "time",
            period: TimeFilterPeriod.PREVIOUS,
            duration: Duration.fromJS("P2D")
          });
          expect(oneDay.constrainToFilter(filter, Timezone.UTC)).to.be.equivalent(empty);
        });
      });

      describe("Current period", () => {
        it("does not touch if shifted period do not overlap with original", () => {
          const filter = new RelativeTimeFilterClause({
            reference: "time",
            period: TimeFilterPeriod.CURRENT,
            duration: Duration.fromJS("P1D")
          });
          expect(oneDay.constrainToFilter(filter, Timezone.UTC)).to.be.equivalent(oneDay);
        });

        it("returns empty time shift if shifted period overlap with original", () => {
          const filter = new RelativeTimeFilterClause({
            reference: "time",
            period: TimeFilterPeriod.CURRENT,
            duration: Duration.fromJS("P2D")
          });
          expect(oneDay.constrainToFilter(filter, Timezone.UTC)).to.be.equivalent(empty);
        });
      });
    });
  });
});
