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
import * as sinon from "sinon";
import { Stage } from "../../../../../common/models/stage/stage";
import { ScrollerLayout } from "../../../../components/scroller/scroller";
import equivalent from "../../../../utils/test-utils/equivalent";
import * as calculateSegmentStageModule from "./calculate-segment-stage";
import { calculateChartStage, calculateLayout, calculateYAxisStage } from "./layout";

use(equivalent);

describe("layout", () => {
  describe("calculateChartStage", () => {
    it("should move stage by margins", () => {
      const stage = Stage.fromSize(100, 80);
      const expected = Stage.fromJS({
        x: 0,
        y: 30,
        height: 50,
        width: 100
      });
      expect(calculateChartStage(stage)).to.be.equivalent(expected);
    });
  });

  describe("calculateYAxisStage", () => {
    it("should calculate stage", () => {
      const stage = Stage.fromSize(100, 80);
      const expected = Stage.fromJS({
        x: 0,
        y: 30,
        height: 50,
        width: 60
      });
      expect(calculateYAxisStage(stage)).to.be.equivalent(expected);
    });
  });

  describe("calculateLayout", () => {
    const bodyStage = Stage.fromSize(1000, 800);
    let calculateSegmentStageStub: sinon.SinonStub;

    beforeEach(() => {
      calculateSegmentStageStub = sinon
        .stub(calculateSegmentStageModule, "calculateSegmentStage")
        .returns(Stage.fromSize(42, 99));
    });

    afterEach(() => {
      calculateSegmentStageStub.restore();
    });

    describe("segment", () => {

      it("should pass stage with margins and rest of parameters", () => {
        calculateLayout(bodyStage, 100, 3);
        const stageWithMargins = Stage.fromClientRect({
          left: 5,
          right: 60,
          top: 0,
          bottom: 40,
          height: 760,
          width: 935
        });
        expect(calculateSegmentStageStub.calledWith(stageWithMargins, 100, 3)).to.be.true;
      });
    });

    describe("scroller", () => {
      it("should calculate scroller layout", () => {
        const layout = calculateLayout(bodyStage, 100, 3);
        const expected: ScrollerLayout = {
          bodyHeight: 297,
          bodyWidth: 42,
          bottom: 40,
          left: 5,
          right: 60,
          top: 0
        };
        expect(layout.scroller).to.be.deep.equal(expected);
      });
    });
  });
});
