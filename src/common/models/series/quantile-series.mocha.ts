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
import { Measure } from "../measure/measure";
import { MeasureFixtures } from "../measure/measure.fixtures";
import { SeriesDerivation } from "./concrete-series";
import { QuantileSeries } from "./quantile-series";

const quantileMeasure = Measure.fromJS({
  name: "my-quantile",
  formula: "$main.quantile($histogram, 0.92, 'tuning')"
});

const quantileSeries = QuantileSeries.fromQuantileMeasure(quantileMeasure);

describe("QuantileSeries", () => {
  describe("fromQuantileMeasure", () => {
    it("throws when measure expression is not a quantile", () => {
      expect(() => QuantileSeries.fromQuantileMeasure(MeasureFixtures.wikiCount())).throws(/Expected QuantileExpression/);
    });

    it("creates QuantileSeries from Measure with quantile expression", () => {
      expect(QuantileSeries.fromQuantileMeasure(quantileMeasure)).to.be.instanceOf(QuantileSeries);
    });

    it("creates QuantileSeries with measure name as reference", () => {
      expect(QuantileSeries.fromQuantileMeasure(quantileMeasure).reference).to.eq("my-quantile");
    });

    it("creates QuantileSeries with percentile taken from expression multiplied by 100", () => {
      expect(QuantileSeries.fromQuantileMeasure(quantileMeasure).percentile).to.eq(92);
    });
  });

  describe("key", () => {
    it("constructs key from reference and percentile", () => {
      expect(quantileSeries.key()).to.eq("my-quantile__p92");
    });
  });

  describe("plywoodKey", () => {
    it("constructs plywood key from reference, period and percentile for current period", () => {
      expect(quantileSeries.plywoodKey(SeriesDerivation.CURRENT)).to.eq("my-quantile__p92");
    });

    it("constructs plywood key from reference, period and percentile for previous period", () => {
      expect(quantileSeries.plywoodKey(SeriesDerivation.PREVIOUS)).to.eq("_previous__my-quantile__p92");
    });

    it("constructs plywood key from reference, period and percentile for delta", () => {
      expect(quantileSeries.plywoodKey(SeriesDerivation.DELTA)).to.eq("_delta__my-quantile__p92");
    });
  });
});
