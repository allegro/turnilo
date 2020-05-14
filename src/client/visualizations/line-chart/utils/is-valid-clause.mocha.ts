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
import { isValidClause } from "./is-valid-clause";

describe("isValidClause", () => {
  it("should return true for FixedTimeFilterClause", () => {
    expect(isValidClause(timeRange("time", new Date("2000-01-01"), new Date("2000-01-02")))).to.be.true;
  });

  it("should return true for NumberFilterClause", () => {
    expect(isValidClause(numberRange("count", 0, 100))).to.be.true;
  });

  it("should return false for RelativeTimeFilterClause", () => {
    expect(isValidClause(timePeriod("time", "P1D", TimeFilterPeriod.CURRENT))).to.be.false;
  });

  it("should return false for BooleanFilterClause", () => {
    expect(isValidClause(boolean("foobar", []))).to.be.false;
  });

  it("should return false for StringFilterClause", () => {
    expect(isValidClause(stringIn("foobar", []))).to.be.false;
  });
});
