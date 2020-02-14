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
import { ROW_HEIGHT } from "../table";
import { visibleIndexRange } from "./visible-index-range";

const tenRowsHeight = 10 * ROW_HEIGHT;

describe("visibleIndexRange", () => {
  describe("no scroll offset", () => {
    it("should return [0, 10] because there's space for only 10 rows", () => {
      expect(visibleIndexRange(12, tenRowsHeight, 0)).to.deep.equal([0, 10]);
    });

    it("should return [0, 4] because there are only 4 rows", () => {
      expect(visibleIndexRange(4, tenRowsHeight, 0)).to.deep.equal([0, 4]);
    });
  });

  describe("with scroll offset", () => {
    it("should return [1, 11] because there's space for only 10 rows and scroll is moved one row", () => {
      expect(visibleIndexRange(12, tenRowsHeight, ROW_HEIGHT)).to.deep.equal([1, 11]);
    });

    it("should return [4, 12] because scroll is moved four rows and there're only 8 rows left", () => {
      const fourRowsHeight = 4 * ROW_HEIGHT;
      expect(visibleIndexRange(12, tenRowsHeight, fourRowsHeight)).to.deep.equal([4, 12]);
    });
  });
});
