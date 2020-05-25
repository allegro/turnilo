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
import { Stage } from "../../../common/models/stage/stage";
import { calculatePosition } from "./calculate-position";

describe("calculatePosition", () => {
  describe("rect not yet initialized", () => {
    it("should add margins", () => {
      const position = calculatePosition({
        top: 100,
        left: 200,
        stage: null
      });
      const expected = {
        top: 110,
        left: 210
      };
      expect(position).to.be.deep.equal(expected);
    });

    it("should allow to override margins ", () => {
      const position = calculatePosition({
        top: 100,
        left: 200,
        margin: 300,
        stage: null
      });
      const expected = {
        top: 400,
        left: 500
      };
      expect(position).to.be.deep.equal(expected);
    });
  });

  describe("rect initialized", () => {
    const defaultRect = {
      left: 110,
      top: 210,
      width: 200,
      height: 200,
      right: 310,
      bottom: 410
    };

    const stage = Stage.fromJS({
      x: 100,
      y: 200,
      width: 800,
      height: 600
    });

    describe("top position", () => {
      it("should just add margin if inside", () => {
        const position = calculatePosition({
          top: defaultRect.top,
          left: defaultRect.left,
          stage
        }, defaultRect);
        expect(position).to.include({ top: 220 });
      });

      it("should move upward if overflows stage at bottom", () => {
        const top = 700;
        const rect = { ...defaultRect, top, bottom: defaultRect.height + top };
        const position = calculatePosition({
          top: rect.top,
          left: rect.left,
          stage
        }, rect);
        expect(position).to.include({ top: 490 });
      });

      it("should move downward if overflows stage at top", () => {
        const top = 100;
        const rect = { ...defaultRect, top, bottom: defaultRect.height + top };
        const position = calculatePosition({
          top: rect.top,
          left: rect.left,
          stage
        }, rect);
        expect(position).to.include({ top: 300 });
      });
    });

    describe("left position", () => {
      it("should just add margin if inside", () => {
        const position = calculatePosition({
          top: defaultRect.top,
          left: defaultRect.left,
          stage
        }, defaultRect);
        expect(position).to.include({ left: 120 });
      });

      it("should move to left if overflows stage at right", () => {
        const left = 900;
        const rect = { ...defaultRect, left, right: defaultRect.width + left };
        const position = calculatePosition({
          top: rect.top,
          left: rect.left,
          stage
        }, rect);
        expect(position).to.include({ left: 690 });
      });

      it("should move to right if overflows stage at left", () => {
        const left = 50;
        const rect = { ...defaultRect, left, right: defaultRect.width + left };
        const position = calculatePosition({
          top: rect.top,
          left: rect.left,
          stage
        }, rect);
        expect(position).to.include({ left: 250 });
      });
    });
  });
});
