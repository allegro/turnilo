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
import { boolean, stringIn } from "../../../../common/models/filter-clause/filter-clause.fixtures";
import { SortOnFixtures } from "../../../../common/models/sort-on/sort-on.fixtures";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { PinboardTileProps, PinboardTileState } from "../pinboard-tile";
import { shouldFetchData } from "./should-fetch";

const wikiChannel = DimensionFixtures.wikiChannel();
const wikiTotals = EssenceFixtures.wikiTotals();

const props = {
  refreshRequestTimestamp: 42,
  essence: wikiTotals,
  dimension: wikiChannel,
  timekeeper: Timekeeper.EMPTY,
  sortOn: SortOnFixtures.defaultA()
} as PinboardTileProps;

const state = {
  searchText: "foobar"
} as PinboardTileState;

describe("shouldFetch", () => {
  it("should return false if props and state are equal", () => {
    expect(shouldFetchData(props, props, state, state)).to.be.false;
  });

  it("should return true if searchText in state is different", () => {
    const stateWithChangedSearchText = { ...state, searchText: "qvux" };
    expect(shouldFetchData(props, props, stateWithChangedSearchText, state)).to.be.true;
  });

  it("should return true if effective filter in essence in props is different", () => {
    const essenceWithNewFilterClause = wikiTotals.changeFilter(wikiTotals.filter.addClause(boolean("isRobot", [true])));
    const propsWithChangedEssence = { ...props, essence: essenceWithNewFilterClause };
    expect(shouldFetchData(propsWithChangedEssence, props, state, state)).to.be.true;
  });

  it("should return false if filter on pinned dimension in essence in props is different", () => {
    const essenceWithChangedFilterClause = wikiTotals.changeFilter(wikiTotals.filter.addClause(stringIn("channel", ["en"])));
    const propsWithChangedEssence = { ...props, essence: essenceWithChangedFilterClause };
    expect(shouldFetchData(propsWithChangedEssence, props, state, state)).to.be.false;
  });

  it("should return true if sortOn in props is different", () => {
    const propsWithChangedSortOn = { ...props, sortOn: SortOnFixtures.defaultC() };
    expect(shouldFetchData(propsWithChangedSortOn, props, state, state)).to.be.true;
  });

  it("should return true if refreshRequestTimestamp in props is different", () => {
    const propsWithChangedSortOn = { ...props, refreshRequestTimestamp: 1000 };
    expect(shouldFetchData(propsWithChangedSortOn, props, state, state)).to.be.true;
  });

  it("should return true if dimension in props is different", () => {
    const propsWithChangedDimension = { ...props, dimension: DimensionFixtures.countryURL() };
    expect(shouldFetchData(propsWithChangedDimension, props, state, state)).to.be.true;
  });
});
