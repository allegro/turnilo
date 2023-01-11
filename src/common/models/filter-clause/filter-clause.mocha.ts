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
import { Duration, Timezone } from "chronoshift";
import { List } from "immutable";
import { DateRange } from "../date-range/date-range";
import { FixedTimeFilterClause, RelativeTimeFilterClause, TimeFilterPeriod } from "./filter-clause";

describe("FilterClause", () => {
  describe("evaluate", () => {
    it("works with now for previous", () => {
      const previousRelative = new RelativeTimeFilterClause({ reference: "time", period: TimeFilterPeriod.PREVIOUS, duration: Duration.fromJS("P1D") });

      const now = new Date("2016-01-15T11:22:33Z");
      const maxTime = new Date("2016-01-15T08:22:00Z");

      const previousFixed = new FixedTimeFilterClause({
        reference: "time",
        values: List.of(new DateRange({
          start: new Date("2016-01-14"),
          end: new Date("2016-01-15")
        }))
      });

      expect(previousRelative.evaluate(now, maxTime, Timezone.UTC)).to.be.equivalent(previousFixed);
    });

    it("works with now for current", () => {
      const currentRelative = new RelativeTimeFilterClause({ reference: "time", period: TimeFilterPeriod.CURRENT, duration: Duration.fromJS("P1D") });

      const now = new Date("2016-01-15T11:22:33Z");
      const maxTime = new Date("2016-01-15T08:22:00Z");

      const currentFixed = new FixedTimeFilterClause({
        reference: "time",
        values: List.of(new DateRange({
          start: new Date("2016-01-15"),
          end: new Date("2016-01-16")
        }))
      });

      expect(currentRelative.evaluate(now, maxTime, Timezone.UTC)).to.be.equivalent(currentFixed);
    });

    it("works with maxTime for latest", () => {
      const relativeClause = new RelativeTimeFilterClause({ reference: "time", period: TimeFilterPeriod.LATEST, duration: Duration.fromJS("P1D") });

      const now = new Date("2016-01-15T11:22:33Z");
      const maxTime = new Date("2016-01-15T08:22:00Z");

      const fixedClause = new FixedTimeFilterClause({
        reference: "time",
        values: List.of(new DateRange({
          end: new Date("2016-01-15T08:23:00Z"),
          start: new Date("2016-01-14T08:23:00Z")
        }))
      });

      expect(relativeClause.evaluate(now, maxTime, Timezone.UTC)).to.be.equivalent(fixedClause);
    });
  });
});
