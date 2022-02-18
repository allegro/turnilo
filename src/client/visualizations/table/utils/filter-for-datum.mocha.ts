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
import { List } from "immutable";
import { NumberRange, TimeRange } from "plywood";
import { EssenceFixtures } from "../../../../common/models/essence/essence.fixtures";
import { FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import {
  boolean,
  numberRange,
  stringIn,
  timeRange
} from "../../../../common/models/filter-clause/filter-clause.fixtures";
import { getFilterFromDatum } from "./filter-for-datum";

describe("getFilterForDatum", () => {
  it("should return filters for nest 4 datum", () => {
    const { splits } = EssenceFixtures.wikiTable();
    const datum = {
      __nest: 4,
      channel: "foobar",
      isRobot: "true",
      commentLength: new NumberRange({ start: 42, end: 71 }),
      time: new TimeRange({ start: new Date(0), end: new Date(10000) })
    };
    const list = getFilterFromDatum(splits, datum);
    expect(list).to.deep.equal(List.of<FilterClause>(
      stringIn("channel", ["foobar"]),
      boolean("isRobot", ["true"]),
      numberRange("commentLength", 42, 71),
      timeRange("time", new Date(0), new Date(10000))
    ));
  });

  it("should return filters for nest 1 datum", () => {
    const { splits } = EssenceFixtures.wikiTable();
    const datum = {
      __nest: 1,
      channel: "foobar"
    };
    const list = getFilterFromDatum(splits, datum);
    expect(list).to.deep.equal(List.of(
      stringIn("channel", ["foobar"])
    ));
  });

  it("should return null for nest 0 datum", () => {
    const { splits } = EssenceFixtures.wikiTable();
    const datum = {
      __nest: 0
    };
    const list = getFilterFromDatum(splits, datum);
    expect(list).to.equal(null);
  });

  it("should return null when data nest is bigger than split count", () => {
    const { splits } = EssenceFixtures.wikiTable();
    const datum = {
      __nest: 5,
      channel: "foobar",
      isRobot: "bazz",
      commentLength: new NumberRange({ start: 42, end: 71 }),
      time: new TimeRange({ start: new Date(0), end: new Date(10000) }),
      nonExistentSplit: "superfluous"
    };
    const list = getFilterFromDatum(splits, datum);
    expect(list).to.equal(null);
  });
});
