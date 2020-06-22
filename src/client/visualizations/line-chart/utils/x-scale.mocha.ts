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
import { createDailyNominalDatasetInJanuary, january, makeDataset } from "../../../utils/dataset/selectors/dataset-fixtures";
import equivalent from "../../../utils/test-utils/equivalent";
import { calculateXRange } from "./x-scale";

use(equivalent);

const essenceInJanuary = (start: number, end: number) => EssenceFixtures
  .wikiLineChartNoNominalSplit()
  .changeFilter(Filter.fromClause(timeRange("time", january(start), january(end))));

const timeRangeInJanuary = (start: number, end: number) => new TimeRange({
  start: january(start),
  end: january(end)
});

const timekeeper = Timekeeper.EMPTY;

const essenceWithoutFilterOnContinuousSplit = EssenceFixtures
  .wikiLineChartNoNominalSplit()
  .changeSplits(Splits.fromSplit(numberSplitCombine("commentLength", 10)), VisStrategy.KeepAlways);

describe("x-scale", () => {
  describe("calculateXRange", () => {
    it("should merge filter and dataset range", () => {
      const essence = essenceInJanuary(1, 5);
      const dataset = createDailyNominalDatasetInJanuary(3, 7);
      const range = calculateXRange(essence, timekeeper, dataset);
      const expected = timeRangeInJanuary(1, 7);
      expect(range).to.be.equivalent(expected);
    });

    it("should return filter range if dataset is empty", () => {
      const essence = essenceInJanuary(1, 5);
      const dataset = makeDataset([]);
      const range = calculateXRange(essence, timekeeper, dataset);
      const expected = timeRangeInJanuary(1, 5);
      expect(range).to.be.equivalent(expected);
    });

    it("should return null if both ranges have no common parts", () => {
      const essence = essenceInJanuary(1, 3);
      const dataset = createDailyNominalDatasetInJanuary(4, 10);
      const range = calculateXRange(essence, timekeeper, dataset);
      expect(range).to.be.null;
    });

    it("should return dataset range if there is no filter for continuous dimension", () => {
      const essence = essenceWithoutFilterOnContinuousSplit;
      const dataset = makeDataset([
        { commentLength: { type: "NUMBER_RANGE", start: 10, end: 20 } },
        { commentLength: { type: "NUMBER_RANGE", start: 20, end: 30 } },
        { commentLength: { type: "NUMBER_RANGE", start: 30, end: 40 } }
      ]);
      const expected = new NumberRange({
        start: 10,
        end: 40
      });
      const range = calculateXRange(essence, timekeeper, dataset);
      expect(range).to.be.equivalent(expected);
    });

    it("should return null if dataset is empty and there is no filter for continuous dimension", () => {
      const essence = essenceWithoutFilterOnContinuousSplit;
      const dataset = makeDataset([]);
      const range = calculateXRange(essence, timekeeper, dataset);
      expect(range).to.be.null;
    });
  });
});
