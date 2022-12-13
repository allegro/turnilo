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
import { MeasureFixtures } from "../../../../common/models/measure/measure.fixtures";
import { fromMeasure } from "../../../../common/models/series/measure-concrete-series";
import { dataset } from "./datum-fixtures";
import scales from "./scales";

const orange = "#ff5a00";
const measure = MeasureFixtures.count();
const concreteSeries = fromMeasure(measure);

describe("scales", () => {
  describe("full data", () => {
    const { x, y, color } = scales(dataset, 20, orange, concreteSeries);

    it("should create x scale with correct domain", () => {
      expect(x.domain()).to.deep.equal([0, 6]);
    });

    it("should create x scale with correct range", () => {
      expect(x.range()).to.deep.equal([0, 120]);
    });

    it("should create y scale with correct domain", () => {
      expect(y.domain()).to.deep.equal([4, 0]);
    });

    it("should create y scale with correct range", () => {
      expect(y.range()).to.deep.equal([80, 0]);
    });

    it("should create color scale with correct domain", () => {
      expect(color.domain()).to.deep.equal([0, 10000]);
    });

    it("should create color scale with correct range", () => {
      expect(color.range()).to.deep.equal(["#fff", "#ff5a00"]);
    });
  });

  describe("empty data", () => {
    const { x, y, color } = scales([], 20, orange, concreteSeries);

    it("should create x scale with empty domain", () => {
      expect(x.domain()).to.deep.equal([0, 0]);
    });

    it("should create x scale with empty range", () => {
      expect(x.range()).to.deep.equal([0, 0]);
    });

    it("should create y scale with empty domain", () => {
      expect(y.domain()).to.deep.equal([0, 0]);
    });

    it("should create y scale with empty range", () => {
      expect(y.range()).to.deep.equal([0, 0]);
    });

    it("should create color scale with NaN domain", () => {
      expect(color.domain()).to.deep.equal([NaN, NaN]);
    });

    it("should create color scale with correct range", () => {
      expect(color.range()).to.deep.equal(["#fff", "#ff5a00"]);
    });
  });
});
