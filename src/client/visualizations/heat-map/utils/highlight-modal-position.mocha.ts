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
import { Stage } from "../../../../common/models/stage/stage";
import { calculateLeft, calculateTop, CoordinatesProps } from "./highlight-modal-position";

const defaults: CoordinatesProps = {
  layout: {
    bodyWidth: 500,
    bodyHeight: 700,
    top: 50,
    right: 0,
    bottom: 0,
    left: 100
  },
  position: {
    column: 5,
    row: 7
  },
  scroll: { left: 30, top: 10 },
  stage: Stage.fromJS({
    height: 200,
    width: 300,
    x: 20,
    y: 50
  })
};

const mockProps = (props: Partial<CoordinatesProps> = {}): CoordinatesProps => ({ ...defaults, ...props });

describe("highlightModalPosition", () => {
  describe("calculateLeft", () => {
    describe("with existing column", () => {
      it("should return correct value", () => {
        expect(calculateLeft(mockProps())).to.be.eq(237);
      });
    });

    describe("without column", () => {
      it("should return middle of body part if scroller width is smaller than stage", () => {
        const props = mockProps({
          position: {
            ...defaults.position,
            column: null
          },
          layout: {
            ...defaults.layout,
            bodyWidth: 200,
            left: 10
          }
        });
        expect(calculateLeft(props)).to.be.eq(130);
      });

      it("should return middle of stage if stage width is smaller than scroller", () => {
        const props = mockProps({
          position: {
            ...defaults.position,
            column: null
          }
        });
        expect(calculateLeft(props)).to.be.eq(170);
      });
    });
  });

  describe("calculateTop", () => {
    describe("with existing row", () => {
      it("should return correct value", () => {
        expect(calculateTop(mockProps())).to.be.eq(260);
      });
    });

    describe("without row", () => {
      it("should return middle of body part if scroller height is smaller than stage", () => {
        const props = mockProps({
          position: {
            ...defaults.position,
            row: null
          },
          layout: {
            ...defaults.layout,
            bodyHeight: 100,
            top: 20
          }
        });
        expect(calculateTop(props)).to.be.eq(120);
      });

      it("should return middle of stage if stage height is smaller than scroller", () => {
        const props = mockProps({
          position: {
            ...defaults.position,
            row: null
          }
        });
        expect(calculateTop(props)).to.be.eq(150);
      });
    });
  });
});
