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
import { ExpressionSeriesOperation } from "../expression/expression";
import { PercentExpression } from "../expression/percent";
import { Measure } from "../measure/measure";
import { MeasureFixtures } from "../measure/measure.fixtures";
import { ExpressionSeries } from "./expression-series";
import { MeasureSeries } from "./measure-series";
import { QuantileSeries } from "./quantile-series";
import { fromJS, fromMeasure } from "./series";
import { DEFAULT_FORMAT } from "./series-format";
import { SeriesType } from "./series-type";

const quantileMeasure = Measure.fromJS({
  name: "quantile",
  formula: "$main.quantile($histogram,0.95,'tuning')"
});

const quantileOperandMeasure = Measure.fromJS({
  name: "quantile_by_100",
  formula: "$main.quantile($histogram,0.95,'tuning').divide(100)"
});

describe("Series", () => {
  describe("fromJS", () => {
    it("should construct Expression Series", () => {
      const params = {
        type: SeriesType.EXPRESSION,
        expression: { operation: ExpressionSeriesOperation.PERCENT_OF_PARENT },
        reference: "count"
      };
      const measure = MeasureFixtures.wikiCount();
      const expected = new ExpressionSeries({
        expression: new PercentExpression({ operation: ExpressionSeriesOperation.PERCENT_OF_PARENT }),
        format: DEFAULT_FORMAT,
        type: SeriesType.EXPRESSION,
        reference: "count"
      });
      expect(fromJS(params, measure)).to.be.equivalent(expected);
    });

    it("should construct Quantile Series", () => {
      const params = {
        type: SeriesType.QUANTILE,
        reference: "quantile"
      };
      const measure = quantileMeasure;
      const expected = new QuantileSeries({
        format: DEFAULT_FORMAT,
        percentile: 95,
        type: SeriesType.QUANTILE,
        reference: "quantile"
      });
      expect(fromJS(params, measure)).to.be.equivalent(expected);
    });

    it("should construct Measure Series", () => {
      const params = {
        type: SeriesType.MEASURE,
        reference: "count"
      };
      const measure = MeasureFixtures.wikiCount();
      const expected = new MeasureSeries({
        format: DEFAULT_FORMAT,
        type: SeriesType.MEASURE,
        reference: "count"
      });
      expect(fromJS(params, measure)).to.be.equivalent(expected);
    });

    it("should construct Quantile Series for Measure definition when passed Measure with quantile expression", () => {
      const params = {
        type: SeriesType.MEASURE,
        reference: "quantile"
      };
      const measure = quantileMeasure;
      const expected = new QuantileSeries({
        format: DEFAULT_FORMAT,
        type: SeriesType.QUANTILE,
        percentile: 95,
        reference: "quantile"
      });
      expect(fromJS(params, measure)).to.be.equivalent(expected);
    });

    it("should construct Measure Series when no type provided", () => {
      const params = {
        reference: "count"
      };
      const measure = MeasureFixtures.wikiCount();
      const expected = new MeasureSeries({
        format: DEFAULT_FORMAT,
        type: SeriesType.MEASURE,
        reference: "count"
      });
      expect(fromJS(params, measure)).to.be.equivalent(expected);
    });

    it("should construct Quantile Series when no type provided but Measure has quantile expression", () => {
      const params = {
        reference: "quantile"
      };
      const measure = quantileMeasure;
      const expected = new QuantileSeries({
        format: DEFAULT_FORMAT,
        type: SeriesType.QUANTILE,
        percentile: 95,
        reference: "quantile"
      });
      expect(fromJS(params, measure)).to.be.equivalent(expected);
    });
  });

  describe("fromMeasure", () => {
    it("should create Measure Series for non-quantile expression", () => {
      expect(fromMeasure(MeasureFixtures.wikiCount())).to.be.instanceOf(MeasureSeries);
    });

    it("should create Quantile Series for quantile expression", () => {
      expect(fromMeasure(quantileMeasure)).to.be.instanceOf(QuantileSeries);
    });

    it("should create Measure Series for expression with quantile operand", () => {
      expect(fromMeasure(quantileOperandMeasure)).to.be.instanceOf(MeasureSeries);
    });
  });
});
