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
import { NumberRange, TimeRange } from "plywood";
import { EssenceFixtures } from "../../../../../common/models/essence/essence.fixtures";
import { nestedSplitName } from "./nested-split-name";

describe("nestedSplitName", () => {
  const wikiTable = EssenceFixtures.wikiTable();

  it("should return 'Total' for nest 0", () => {
    expect(nestedSplitName({ __nest: 0 }, wikiTable)).to.equal("Total");
  });

  it("should return formatted first split value for nest 1", () => {
    expect(nestedSplitName({ __nest: 1, channel: "foobar" }, wikiTable)).to.equal("foobar");
  });

  it("should return formatted third split values for nest 3", () => {
    const datum = {
      __nest: 3,
      commentLength: new NumberRange({ start: 42, end: 71 })
    };
    expect(nestedSplitName(datum, wikiTable)).to.equal("42 to 71");
  });

  it("should return formatted fourth split values for nest 4", () => {
    const datum = {
      __nest: 4,
      time: new TimeRange({ start: new Date("2010-01-01"), end: new Date("2010-01-02") })
    };
    expect(nestedSplitName(datum, wikiTable)).to.equal("1 Jan 2010");
  });
});
