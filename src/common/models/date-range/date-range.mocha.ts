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
import { Duration, Timezone } from "chronoshift";
import { DateRange } from "./date-range";

use(chaiDatetime);

function makeRange(startIso: string, endIso: string): DateRange {
  return new DateRange({
    start: new Date(startIso),
    end: new Date(endIso)
  });
}

const range = makeRange("2010-01-02", "2010-02-12");

describe("DateRange", () => {
  describe("intersects", () => {
    it("handles null values", () => {
      expect(range.intersects(null)).to.be.false;
    });

    it("range intersects with contained range", () => {
      const other = makeRange("2010-01-05", "2010-02-10");
      expect(range.intersects(other)).to.be.true;
    });

    it("range intersects with overlapping range", () => {
      const other = makeRange("2010-02-05", "2010-03-10");
      expect(range.intersects(other)).to.be.true;
    });

    it("range intersects with itself", () => {
      expect(range.intersects(range)).to.be.true;
    });

    it("range does not intersect with adjacent range", () => {
      const other = makeRange("2010-02-12", "2010-02-13");
      expect(range.intersects(other)).to.be.false;
    });
  });

  describe("shift", () => {
    it("shifts both dates", () => {
      const shifted = range.shift(Duration.fromJS("P1D"), Timezone.UTC);
      expect(shifted.start).to.equalDate(new Date("2010-01-01"));
      expect(shifted.end).to.equalDate(new Date("2010-02-11"));
    });
  });
});
