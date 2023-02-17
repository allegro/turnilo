/*
 * Copyright 2017-2022 Allegro.pl
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
import { ArithmeticExpression } from "../expression/concreteArithmeticOperation";
import { ExpressionSeriesOperation } from "../expression/expression";
import { PercentExpression } from "../expression/percent";
import { MeasureFixtures } from "../measure/measure.fixtures";
import { ExpressionSeries } from "./expression-series";
import { MeasureSeries } from "./measure-series";
import { QuantileSeries } from "./quantile-series";
import { usedMeasures } from "./used-measures";

const avgDelta = MeasureFixtures.avgDelta();
const avgAdded = MeasureFixtures.avgAdded();
const histogram = MeasureFixtures.histogram();

describe("usedMeasures", () => {
  describe("MeasureSeries", () => {
    it("should return array with measure reference", () => {
      const series = MeasureSeries.fromMeasure(avgDelta);
      expect(usedMeasures(series)).to.be.deep.equal(["avg_delta"]);
    });
  });

  describe("QuantileSeries", () => {
    it("should return array with measure reference", () => {
      const series = QuantileSeries.fromQuantileMeasure(histogram);
      expect(usedMeasures(series)).to.be.deep.equal(["histogram"]);
    });
  });

  describe("ExpressionSeries", () => {
    describe("Percent of total", () => {
      it("should return array with measure reference", () => {
        const series = ExpressionSeries.fromJS({
          reference: avgDelta.name,
          expression: new PercentExpression({
            operation: ExpressionSeriesOperation.PERCENT_OF_TOTAL
          })
        });
        expect(usedMeasures(series)).to.be.deep.equal(["avg_delta"]);
      });
    });

    describe("Percent of parent", () => {
      it("should return array with measure reference", () => {
        const series = ExpressionSeries.fromJS({
          reference: avgDelta.name,
          expression: new PercentExpression({
            operation: ExpressionSeriesOperation.PERCENT_OF_PARENT
          })
        });
        expect(usedMeasures(series)).to.be.deep.equal(["avg_delta"]);
      });
    });

    describe("Arithmetic ADD", () => {
      it("should return array with measure reference and reference of operand", () => {
        const series = ExpressionSeries.fromJS({
          reference: avgDelta.name,
          expression: new ArithmeticExpression({
            operation: ExpressionSeriesOperation.ADD,
            reference: avgAdded.name
          })
        });
        expect(usedMeasures(series)).to.be.deep.equal(["avg_delta", "avg_added"]);
      });
    });

    describe("Arithmetic SUBTRACT", () => {
      it("should return array with measure reference and reference of operand", () => {
        const series = ExpressionSeries.fromJS({
          reference: avgDelta.name,
          expression: new ArithmeticExpression({
            operation: ExpressionSeriesOperation.SUBTRACT,
            reference: avgAdded.name
          })
        });
        expect(usedMeasures(series)).to.be.deep.equal(["avg_delta", "avg_added"]);
      });
    });

    describe("Arithmetic MULTIPLY", () => {
      it("should return array with measure reference and reference of operand", () => {
        const series = ExpressionSeries.fromJS({
          reference: avgDelta.name,
          expression: new ArithmeticExpression({
            operation: ExpressionSeriesOperation.MULTIPLY,
            reference: avgAdded.name
          })
        });
        expect(usedMeasures(series)).to.be.deep.equal(["avg_delta", "avg_added"]);
      });
    });

    describe("Arithmetic DIVIDE", () => {
      it("should return array with measure reference and reference of operand", () => {
        const series = ExpressionSeries.fromJS({
          reference: avgDelta.name,
          expression: new ArithmeticExpression({
            operation: ExpressionSeriesOperation.DIVIDE,
            reference: avgAdded.name
          })
        });
        expect(usedMeasures(series)).to.be.deep.equal(["avg_delta", "avg_added"]);
      });
    });
  });
});
