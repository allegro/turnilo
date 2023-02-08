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
import { DimensionFixtures } from "../../../../common/models/dimension/dimension.fixtures";
import { EssenceFixtures } from "../../../../common/models/essence/essence.fixtures";
import { stringContains } from "../../../../common/models/filter-clause/filter-clause.fixtures";
import { SortOnFixtures } from "../../../../common/models/sort-on/sort-on.fixtures";
import { booleanSplitCombine, stringSplitCombine } from "../../../../common/models/split/split.fixtures";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { equalParams, QueryParams } from "./query-params";

const wikiChannel = DimensionFixtures.wikiChannel();
const wikiTotals = EssenceFixtures.wikiTotals();

const mockQueryParams = (): QueryParams => ({
  split: stringSplitCombine(wikiChannel.name),
  clause: stringContains(wikiChannel.name, "e"),
  essence: wikiTotals
});

describe("QueryParams", () => {
  describe("equalParams", () => {
    it("should return true if all params are equal", () => {
      const params = mockQueryParams();
      expect(equalParams(params, params)).to.be.true;
    });

    it("should return false if split is different", () => {
      const params = mockQueryParams();
      const changedSplit = { ...params, split: booleanSplitCombine(DimensionFixtures.wikiIsRobot().name) };
      expect(equalParams(params, changedSplit)).to.be.false;
    });

    it("should return false if essence is different", () => {
      const params = mockQueryParams();
      const changedEssence = { ...params, essence: EssenceFixtures.wikiLineChart() };
      expect(equalParams(params, changedEssence)).to.be.false;
    });

    it("should return false if clause is different", () => {
      const params = mockQueryParams();
      const changedClause = { ...params, clause: stringContains(wikiChannel.name, "a") };
      expect(equalParams(params, changedClause)).to.be.false;
    });
  });
});
