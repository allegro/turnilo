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
import { NumberRange, TimeRange } from "plywood";
import { VisStrategy } from "../../../../common/models/essence/essence";
import { EssenceFixtures } from "../../../../common/models/essence/essence.fixtures";
import { timeRange } from "../../../../common/models/filter-clause/filter-clause.fixtures";
import { Filter } from "../../../../common/models/filter/filter";
import { numberSplitCombine } from "../../../../common/models/split/split.fixtures";
import { Splits } from "../../../../common/models/splits/splits";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import equivalent from "../../../utils/test-utils/equivalent";
import { createDailyNominalDatasetInJanuary, january, makeDataset } from "./dataset-fixtures";
import { calculateXRange } from "./x-scale";

use(equivalent);

const essenceInJanuary = (start: number, end: number) => EssenceFixtures
  .wikiLineChartNoNominalSplit()
  .changeFilter(Filter.fromClause(timeRange("time", january(start), january(end))));

const timeRangeInJanuary = (start: number, end: number) => new TimeRange({
  start: january(start),
  end: january(end)
});

describe("x-scale", () => {
  describe("calculateXRange", () => {
    it("should merge filter and dataset range", () => {
      const essence = essenceInJanuary(1, 5);
      const dataset = createDailyNominalDatasetInJanuary(3, 7);
      expect(calculateXRange(essence, Timekeeper.EMPTY, dataset)).to.be.equivalent(timeRangeInJanuary(1, 7));
    });

    it("should return filter range if dataset is empty", () => {
      const essence = essenceInJanuary(1, 5);
      const dataset = makeDataset([]);
      expect(calculateXRange(essence, Timekeeper.EMPTY, dataset)).to.be.equivalent(timeRangeInJanuary(1, 5));
    });

    it("should return null if both ranges have no common parts", () => {
      const essence = essenceInJanuary(1, 3);
      const dataset = createDailyNominalDatasetInJanuary(4, 10);
      expect(calculateXRange(essence, Timekeeper.EMPTY, dataset)).to.be.null;
    });

    it("should return dataset range if there is no filter for continuous dimension", () => {
      const essence = EssenceFixtures
        .wikiLineChartNoNominalSplit()
        .changeSplits(Splits.fromSplit(numberSplitCombine("commentLength", 10)), VisStrategy.KeepAlways);
      const dataset = makeDataset([
        { commentLength: { type: "NUMBER_RANGE", start: 10, end: 20 } },
        { commentLength: { type: "NUMBER_RANGE", start: 20, end: 30 } },
        { commentLength: { type: "NUMBER_RANGE", start: 30, end: 40 } }
      ]);
      const expectedRange = new NumberRange({
        start: 10,
        end: 40
      });
      expect(calculateXRange(essence, Timekeeper.EMPTY, dataset)).to.be.equivalent(expectedRange);
    });
  });
});
