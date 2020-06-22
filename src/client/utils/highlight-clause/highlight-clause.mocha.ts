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
import { NumberRange, StringRange, TimeRange } from "plywood";
import { numberRange, stringIn, timeRange } from "../../../common/models/filter-clause/filter-clause.fixtures";
import equivalent from "../test-utils/equivalent";
import { toFilterClause, toPlywoodRange } from "./highlight-clause";

use(equivalent);

describe("highlightClause", () => {

  describe("toFilterClause", () => {
    it("should throw on invalid range type", () => {
      expect(() => toFilterClause(new StringRange({ start: "a", end: "z" }) as any, "foobar")).to.throw("Expected Number or Time range");
    });

    it("should create fixed time clause for time range", () => {
      const start = new Date("2000-01-01");
      const end = new Date("2000-01-02");
      expect(toFilterClause(new TimeRange({ start, end }), "time")).to.equivalent(timeRange("time", start, end));
    });

    it("should create number clause for number range", () => {
      const start = 0;
      const end = 100;
      expect(toFilterClause(new NumberRange({ start, end }), "count")).to.equivalent(numberRange("count", start, end));
    });
  });

  describe("toPlywoodRange", () => {
    it("should throw on invalid clause type", () => {
      expect(() => toPlywoodRange(stringIn("foobar", []))).to.throw("Expected Number or FixedTime Filter Clause");
    });

    it("should create time range for fixed time clause", () => {
      const start = new Date("2000-01-01");
      const end = new Date("2000-01-02");
      expect(toPlywoodRange(timeRange("time", start, end))).to.equivalent(new TimeRange({ start, end }));
    });

    it("should create number range for number clause", () => {
      const start = 0;
      const end = 100;
      expect(toPlywoodRange(numberRange("count", start, end))).to.equivalent(new NumberRange({ start, end }));
    });
  });
});
