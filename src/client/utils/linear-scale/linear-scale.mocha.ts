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
import getScale from "./linear-scale";

describe("linear-scale", () => {
  describe("getScale", () => {
    it("should return null for NaN extent", () => {
      expect(getScale([NaN, 100], 100)).to.be.null;
      expect(getScale([100, NaN], 100)).to.be.null;
    });

    it("should return scale with correct range", () => {
      const scale = getScale([0, 100], 389);
      expect(scale.range()).to.be.deep.eq([389, 0]);
    });

    it("should nicely pad upper range if positive", () => {
      const scale = getScale([0, 113], 10);
      expect(scale.domain()).to.be.deep.eq([0, 120]);
    });

    it("should nicely pad lower range if negative", () => {
      const scale = getScale([-109, 0], 10);
      expect(scale.domain()).to.be.deep.eq([-120, 0]);
    });

    it("should snap upper range to zero if negative", () => {
      const scale = getScale([-100, -20], 10);
      expect(scale.domain()).to.be.deep.eq([-100, 0]);
    });

    it("should snap lower range to zero if positive", () => {
      const scale = getScale([10, 100], 10);
      expect(scale.domain()).to.be.deep.eq([0, 100]);
    });
  });
});
