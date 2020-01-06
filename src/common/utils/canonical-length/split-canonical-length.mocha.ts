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
import { hour, month } from "chronoshift";
import { DataCubeFixtures } from "../../models/data-cube/data-cube.fixtures";
import { stringSplitCombine, timeSplitCombine } from "../../models/split/split.fixtures";
import splitCanonicalLength from "./split-canonical-length";

const dataCube = DataCubeFixtures.wiki();
const timeSplitName = dataCube.timeAttribute.name;

describe("Split canonical length", () => {
  it("returns null for non-time split", () => {
    const stringSplit = stringSplitCombine("foobar");
    expect(splitCanonicalLength(stringSplit, dataCube)).to.be.null;
  });

  it("returns bucket canonical length for time split with hour granularity", () => {
    const timeSplit = timeSplitCombine(timeSplitName, "PT1H");
    expect(splitCanonicalLength(timeSplit, dataCube)).to.equal(hour.canonicalLength);
  });

  it("returns bucket canonical length for time split with month granularity", () => {
    const timeSplit = timeSplitCombine(timeSplitName, "P1M");
    expect(splitCanonicalLength(timeSplit, dataCube)).to.equal(month.canonicalLength);
  });
});
