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
import { DimensionFixtures } from "../../../../common/models/dimension/dimension.fixtures";
import { isDimensionPinnable } from "./is-dimension-pinnable";

describe("isDimensionPinnable", () => {
    it("should return true for string dimension", () => {
      expect(isDimensionPinnable(DimensionFixtures.countryString())).to.be.true;
    });

    it("should return true for boolean dimension", () => {
      expect(isDimensionPinnable(DimensionFixtures.wikiIsRobot())).to.be.true;
    });

    it("should return false for number dimension", () => {
      expect(isDimensionPinnable(DimensionFixtures.wikiCommentLength())).to.be.false;
    });

    it("should return false for time dimension", () => {
      expect(isDimensionPinnable(DimensionFixtures.wikiTime())).to.be.false;
    });
});
