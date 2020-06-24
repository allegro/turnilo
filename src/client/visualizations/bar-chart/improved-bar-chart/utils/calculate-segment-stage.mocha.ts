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
import { Stage } from "../../../../../common/models/stage/stage";
import equivalent from "../../../../utils/test-utils/equivalent";
import { calculateSegmentStage } from "./calculate-segment-stage";

use(equivalent);

const bodyStage = Stage.fromSize(1000, 800);

describe("calculateSegmentStage", () => {
  describe("width", () => {
    it("should set width to at least width of body", () => {
      const stage = calculateSegmentStage(bodyStage, 1, 1);
      expect(stage.width).to.be.equal(bodyStage.width);
    });

    it("should set width domain size * minimal bar width if big enough", () => {
      const minimalBarWidth = 30;
      const domainSize = 2000;
      const stage = calculateSegmentStage(bodyStage, domainSize, 1);
      expect(stage.width).to.be.equal(domainSize * minimalBarWidth);
    });
  });

  describe("height", () => {
    it("should divide available space to charts", () => {
      const stage = calculateSegmentStage(bodyStage, 1, 3);
      expect(stage.height).to.be.equal(266);
    });

    it("should respect minimal chart height", () => {
      const minimalChartHeight = 200;
      const stage = calculateSegmentStage(bodyStage, 1, 10);
      expect(stage.height).to.be.equal(minimalChartHeight);
    });
  });
});
