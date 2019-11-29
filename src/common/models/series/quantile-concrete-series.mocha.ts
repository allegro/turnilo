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
import { ApplyExpression, Expression, QuantileExpression } from "plywood";
import { Measure } from "../measure/measure";
import { SeriesDerivation } from "./concrete-series";
import { QuantileConcreteSeries } from "./quantile-concrete-series";
import { QuantileSeries } from "./quantile-series";

const quantileMeasure = Measure.fromJS({
  title: "Quantile Title",
  name: "my-quantile",
  formula: "$main.quantile($histogram, 0.93, 'tuning')"
});

const quantileSeries = new QuantileSeries({
  reference: "my-quantile",
  percentile: 75
});

const quantileConcreteSeries = new QuantileConcreteSeries(quantileSeries, quantileMeasure);

describe("QuantileConcreteSeries", () => {
  describe("reactKey", () => {
    it("constructs react key for current period", () => {
      expect(quantileConcreteSeries.reactKey()).to.be.eq("my-quantile__p75");
    });
    it("constructs react key for previous period", () => {
      expect(quantileConcreteSeries.reactKey(SeriesDerivation.PREVIOUS)).to.be.eq("my-quantile__p75-previous");
    });
    it("constructs react key for delta", () => {
      expect(quantileConcreteSeries.reactKey(SeriesDerivation.DELTA)).to.be.eq("my-quantile__p75-delta");
    });
  });

  describe("title", () => {
    it("constructs title for current period", () => {
      expect(quantileConcreteSeries.title()).to.be.eq("Quantile Title p75");
    });
    it("constructs title for previous period", () => {
      expect(quantileConcreteSeries.title(SeriesDerivation.PREVIOUS)).to.be.eq("Previous Quantile Title p75");
    });
    it("constructs title for delta", () => {
      expect(quantileConcreteSeries.title(SeriesDerivation.DELTA)).to.be.eq("Difference Quantile Title p75");
    });
  });

  describe("applyExpression", () => {
    it("should throw if expression is not a quantile expression", () => {
      const expression = Expression.parse("$main.count()");
      // @ts-ignore: access protected property
      expect(() => quantileConcreteSeries.applyExpression(expression, "name", 0)).throws();
    });

    it("should create ApplyExpression", () => {
      const expression = quantileMeasure.expression;
      // @ts-ignore: access protected property
      expect(quantileConcreteSeries.applyExpression(expression, "name", 0)).to.be.instanceOf(ApplyExpression);
    });

    it("should pass name to new ApplyExpression", () => {
      const expression = quantileMeasure.expression;
      // @ts-ignore: access protected property
      expect(quantileConcreteSeries.applyExpression(expression, "new-name", 0).name).to.be.eq("new-name");
    });

    it("should override percentile in inner expression", () => {
      const expression = quantileMeasure.expression;
      // @ts-ignore: access protected property
      const applyExpression = quantileConcreteSeries.applyExpression(expression, "name", 0);
      expect(applyExpression.expression).to.be.instanceOf(QuantileExpression);
      expect((applyExpression.expression as QuantileExpression).value).to.be.eq(0.75);
    });
  });
});
