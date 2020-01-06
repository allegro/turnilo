/*
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
import { day, month } from "chronoshift";
import { List } from "immutable";
import { EssenceFixtures } from "../../models/essence/essence.fixtures";
import { TimeFilterPeriod } from "../../models/filter-clause/filter-clause";
import { timePeriod } from "../../models/filter-clause/filter-clause.fixtures";
import { Filter } from "../../models/filter/filter";
import { TimekeeperFixtures } from "../../models/timekeeper/timekeeper.fixtures";
import timeFilterCanonicalLength from "./time-filter-canonical-length";

const timekeeper = TimekeeperFixtures.fixed();

describe("Time filter canonical length", () => {
  it("returns canonical length of time filter for one day", () => {
    const essence = EssenceFixtures.wikiTable();
    expect(timeFilterCanonicalLength(essence, timekeeper)).to.equal(day.canonicalLength);
  });

  it("returns canonical length of time filter for one month", () => {
    const essence = EssenceFixtures.wikiTable();
    const oneMonthTimeClause = timePeriod("time", "P1M", TimeFilterPeriod.CURRENT);
    const oneMonthFilter = new Filter({ clauses: List.of(oneMonthTimeClause) });
    const essenceWithOneMonthFilter = essence.changeFilter(oneMonthFilter);
    expect(timeFilterCanonicalLength(essenceWithOneMonthFilter, timekeeper)).to.equal(month.canonicalLength);
  });
});
