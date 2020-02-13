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
import { getVisibleIndices } from "./visible-indexes";

describe("getVisibleIndices", () => {
  it("should return first indices when no scroll given", () => {
    expect(getVisibleIndices(100, 200, 0)).to.deep.equal([0, 7]);
  });

  it("should return indices when scrolled down", () => {
    expect(getVisibleIndices(100, 200, 100)).to.deep.equal([3, 10]);
  });

  it("should return all indices when not enough rows to fill height", () => {
    expect(getVisibleIndices(5, 200, 0)).to.deep.equal([0, 5]);
  });
});
