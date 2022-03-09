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
import { TimeRange } from "plywood";
import { january } from "../../../../utils/dataset/selectors/dataset-fixtures";
import equivalent from "../../../../utils/test-utils/equivalent";
import { createXScale } from "./x-scale";

use(equivalent);

const januaryDateAsRange = (date: number) => new TimeRange({
  start: january(date),
  end: january(date + 1)
});

describe("x-scale", () => {
  describe("createXScale", () => {
    describe("TimeRange", () => {
      const domain = [
        januaryDateAsRange(1),
        januaryDateAsRange(2),
        januaryDateAsRange(3)
      ];
      const width = 90;

      const scale = createXScale(domain, width);

      it("should return domain", () => {
        expect(scale.domain()).to.be.deep.equal(domain);
      });

      it("should return range band", () => {
        expect(scale.bandwidth()).to.be.equal(30);
      });

      it("should apply scale function", () => {
        expect(scale.calculate(januaryDateAsRange(2))).to.be.equal(30);
      });

      it("should invert pixels", () => {
        expect(scale.invert(45)).to.be.equivalent(januaryDateAsRange(2));
      });
    });
  });
});
