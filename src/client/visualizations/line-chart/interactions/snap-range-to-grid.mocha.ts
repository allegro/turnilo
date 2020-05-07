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
import { VisStrategy } from "../../../../common/models/essence/essence";
import { EssenceFixtures } from "../../../../common/models/essence/essence.fixtures";
import { numberSplitCombine } from "../../../../common/models/split/split.fixtures";
import equivalent from "../../../utils/test-utils/equivalent";
import { snapRangeToGrid } from "./snap-range-to-grid";

use(equivalent);

const essence = EssenceFixtures.wikiLineChart();

describe("snapRangeToGrid", () => {
  it("should return null for non continuous range", () => {
    expect(snapRangeToGrid(new StringRange({ start: "a", end: "z" }), essence)).to.be.null;
  });

  it("should snap time range according to split bucket", () => {
    const start = new Date("2000-01-01T03:22:11Z");
    const end = new Date("2000-01-01T07:11:35Z");
    expect(snapRangeToGrid(new TimeRange({ start, end }), essence)).to.be.equivalent(new TimeRange({
      start: new Date("2000-01-01T03:00Z"),
      end: new Date("2000-01-01T08:00Z")
    }));
  });

  it("should snap number range according to split bucket", () => {
    const start = 3;
    const end = 31;
    const essence = EssenceFixtures.twitterNoVisualisation().changeSplit(numberSplitCombine("tweetLength", 10), VisStrategy.FairGame);
    expect(snapRangeToGrid(new NumberRange({ start, end }), essence)).to.be.equivalent(new NumberRange({
      start: 0,
      end: 30
    }));
  });
});
