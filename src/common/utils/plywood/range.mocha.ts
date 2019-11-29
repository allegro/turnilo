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
import { PlywoodRange, Range } from "plywood";
import { union } from "./range";

describe("Plywood Range", () => {
  describe("union", () => {
    it("should calculate correct union", () => {
      const a = Range.fromJS({ start: 1, end: 3 });
      const b = Range.fromJS({ start: 3, end: 5 });

      expect(union(a, b)).to.be.deep.equal(Range.fromJS({ start: 1, end: 5 }));
    });

    it("should calculate correct union for overlaps", () => {
      const a = Range.fromJS({ start: 1, end: 3 });
      const b = Range.fromJS({ start: 2, end: 4 });

      expect(union(a, b)).to.be.deep.equal(Range.fromJS({ start: 1, end: 4 }));
    });

    it("should handle first non range", () => {
      const range = Range.fromJS({ start: 2, end: 4 });
      expect(union(null, range)).to.be.deep.equal(range);
      expect(union(undefined, range)).to.be.deep.equal(range);
      expect(union({} as PlywoodRange, range)).to.be.deep.equal(range);
    });

    it("should handle second non range", () => {
      const range = Range.fromJS({ start: 2, end: 4 });
      expect(union(range, null)).to.be.deep.equal(range);
      expect(union(range, undefined)).to.be.deep.equal(range);
      expect(union(range, {} as PlywoodRange)).to.be.deep.equal(range);
    });

    it("should return null when no ranges", () => {
      expect(union(undefined, null)).to.be.null;
      expect(union(undefined, undefined)).to.be.null;
      expect(union(null, {} as PlywoodRange)).to.be.null;
      expect(union({} as PlywoodRange, null)).to.be.null;
      expect(union({} as PlywoodRange, undefined)).to.be.null;
    });
  });
});
