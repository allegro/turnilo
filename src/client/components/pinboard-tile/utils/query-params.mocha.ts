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
import { SortOnFixtures } from "../../../../common/models/sort-on/sort-on.fixtures";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { equalParams, QueryParams } from "./query-params";

const wikiTime = DimensionFixtures.wikiTime();
const wikiTotals = EssenceFixtures.wikiTotals();

const mockQueryParams = (): QueryParams => ({
  essence: wikiTotals,
  dimension: wikiTime,
  timekeeper: Timekeeper.EMPTY,
  searchText: "search",
  sortOn: SortOnFixtures.defaultA()
});

describe("QueryParams", () => {
  describe("equalParams", () => {
    it("should return true if all params are equal", () => {
      expect(equalParams(mockQueryParams(), mockQueryParams())).to.be.true;
    });

    it("should return false if dimension is different", () => {
      expect(equalParams(mockQueryParams(), { ...mockQueryParams(), dimension: DimensionFixtures.countryURL() })).to.be.false;
    });

    it("should return false if timekeeper is different", () => {
      expect(equalParams(mockQueryParams(), { ...mockQueryParams(), timekeeper: Timekeeper.fromJS({ timeTags: [] }) })).to.be.false;
    });
    it("should return false if essence is different", () => {
      expect(equalParams(mockQueryParams(), { ...mockQueryParams(), essence: EssenceFixtures.wikiLineChart() })).to.be.false;
    });
    it("should return false if searchText is different", () => {
      expect(equalParams(mockQueryParams(), { ...mockQueryParams(), searchText: "foobar" })).to.be.false;
    });
    it("should return false if sortOn is different", () => {
      expect(equalParams(mockQueryParams(), { ...mockQueryParams(), sortOn: SortOnFixtures.defaultC() })).to.be.false;
    });
  });
});
