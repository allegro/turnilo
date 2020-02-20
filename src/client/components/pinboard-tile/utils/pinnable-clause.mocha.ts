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
import { expect } from "chai";
import { TimeFilterPeriod } from "../../../../common/models/filter-clause/filter-clause";
import { boolean, numberRange, stringIn, timePeriod, timeRange } from "../../../../common/models/filter-clause/filter-clause.fixtures";
import { isPinnableClause } from "./pinnable-clause";

describe("PinnableClause", () => {
  describe("type guard", () => {
    it("should return true for StringFilterClause", () => {
      expect(isPinnableClause(stringIn("foobar", []))).to.be.true;
    });

    it("should return true for BooleanFilterClause", () => {
      expect(isPinnableClause(boolean("foobar", []))).to.be.true;
    });

    it("should return false for null", () => {
      expect(isPinnableClause(null)).to.be.false;
    });

    it("should return false for NumberFilterClause", () => {
      expect(isPinnableClause(numberRange("foobar", 0, 100))).to.be.false;
    });

    it("should return false for RelativeTimeFilterClause", () => {
      expect(isPinnableClause(timePeriod("time", "P1D", TimeFilterPeriod.CURRENT))).to.be.false;
    });

    it("should return false for FixedTimeFilterClause", () => {
      expect(isPinnableClause(timeRange("time", new Date(0), new Date(1)))).to.be.false;
    });
  });
});
