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
import { EssenceFixtures } from "../../../../common/models/essence/essence.fixtures";
import { TimeShift } from "../../../../common/models/time-shift/time-shift";
import { measureColumnsCount } from "./measure-columns-count";

describe("measureColumnsCount", () => {
  it("should return series count when timeshift is off", () => {
    const essence = EssenceFixtures.wikiTable();
    const count = measureColumnsCount(essence);
    expect(count).to.equal(3);
  });

  it("should return series count times three when timeshift is on", () => {
    const essence = EssenceFixtures.wikiTable().changeComparisonShift(TimeShift.fromJS("P1D"));
    const count = measureColumnsCount(essence);
    expect(count).to.equal(9);
  });
});
