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
import { Datum } from "plywood";
import { Measure } from "../../../common/models/measure/measure";
import { SeriesDerivation } from "../../../common/models/series/concrete-series";
import { MeasureConcreteSeries } from "../../../common/models/series/measure-concrete-series";
import { MeasureSeries } from "../../../common/models/series/measure-series";
import { datumsExtent, Selector, seriesSelectors } from "./extent";

describe("extent", () => {
  describe("seriesSelectors", () => {
    const reference = "count";
    const seriesFixture = new MeasureConcreteSeries(
      new MeasureSeries({ reference }),
      Measure.fromJS({ title: "Count", name: reference, formula: "$main.count()" }));

    const datumFixture = {
      [seriesFixture.plywoodKey()]: 42,
      [seriesFixture.plywoodKey(SeriesDerivation.PREVIOUS)]: 101
    } as Datum;

    describe("hasComparison is false", () => {
      it("should return one selector", () => {
        const selectors = seriesSelectors(seriesFixture, false);
        expect(selectors).to.have.length(1);
      });

      it("should return selector which pick current value", () => {
        const [selector] = seriesSelectors(seriesFixture, false);
        expect(selector(datumFixture)).to.be.equal(42);
      });
    });

    describe("hasComparison is true", () => {
      it("should return two selectors", () => {
        const selectors = seriesSelectors(seriesFixture, true);
        expect(selectors).to.have.length(2);
      });

      it("should return selector which pick current value", () => {
        const [selector] = seriesSelectors(seriesFixture, true);
        expect(selector(datumFixture)).to.be.equal(42);
      });

      it("should return selector which pick previous value", () => {
        const [, selector] = seriesSelectors(seriesFixture, true);
        expect(selector(datumFixture)).to.be.equal(101);
      });
    });
  });

  describe("datumsExtent", () => {
    const fooSelector: Selector = d => d.foo as number;
    const barSelector: Selector = d => d.bar as number;

    const datumsFixture = [
      { foo: 0, bar: 100 },
      { foo: 1, bar: -200 },
      { foo: 3, bar: 4 }
    ];

    it("should pick extent by one selector", () => {
      const selectors = [fooSelector];
      expect(datumsExtent(datumsFixture, selectors)).to.be.deep.equal([0, 3]);
    });

    it("should pick extent by two selectors", () => {
      const selectors = [fooSelector, barSelector];
      expect(datumsExtent(datumsFixture, selectors)).to.be.deep.equal([-200, 100]);
    });
  });
});
