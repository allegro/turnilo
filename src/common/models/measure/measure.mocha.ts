/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import { $, AttributeInfo, Expression } from "plywood";
import { fromConfig, measuresFromAttributeInfo } from "./measure";
import { createMeasure } from "./measures";

describe("Measure", () => {
  describe("back compat", () => {
    it("upgrades expression to formula", () => {
      const measure = fromConfig({
        name: "avg_price",
        title: "Average Price",
        expression: "$main.average($price)"
      });
      expect(measure.expression).to.be.equivalent(Expression.parse("$main.average($price)"));
    });
  });

  describe("measuresFromAttributeInfo", () => {
    it("works with sum", () => {
      const attribute = AttributeInfo.fromJS({
        name: "price",
        type: "NUMBER",
        unsplitable: true,
        maker: {
          action: "sum",
          expression: {
            name: "price",
            op: "ref"
          }
        }
      });
      const measures = measuresFromAttributeInfo(attribute);
      expect(measures).to.deep.equal([createMeasure("price", $("main").sum($("price")))]);
    });

    it("works with min", () => {
      const attribute = AttributeInfo.fromJS({
        name: "price",
        type: "NUMBER",
        unsplitable: true,
        maker: {
          action: "min",
          expression: {
            name: "price",
            op: "ref"
          }
        }
      });
      const measures = measuresFromAttributeInfo(attribute);
      expect(measures).to.deep.equal([createMeasure("price", $("main").min($("price")))]);
    });

    it("works with max", () => {
      const attribute = AttributeInfo.fromJS({
        name: "price",
        type: "NUMBER",
        unsplitable: true,
        maker: {
          action: "max",
          expression: {
            name: "price",
            op: "ref"
          }
        }
      });

      const measures = measuresFromAttributeInfo(attribute);
      expect(measures).to.deep.equal([createMeasure("price", $("main").max($("price")))]);
    });

    it("works with approximate histogram", () => {
      const attribute = AttributeInfo.fromJS({
        name: "delta_histogram",
        nativeType: "approximateHistogram",
        type: "NUMBER"
      });

      const measures = measuresFromAttributeInfo(attribute);
      expect(measures).to.deep.equal([createMeasure("delta_histogram_p98", $("main").quantile($("delta_histogram"), 0.98))]);
    });

    it("works with quantiles double sketch", () => {
      const attribute = AttributeInfo.fromJS({
        name: "delta_quantiles",
        nativeType: "quantilesDoublesSketch",
        type: "NUMBER"
      });

      const measures = measuresFromAttributeInfo(attribute);
      expect(measures).to.deep.equal([createMeasure("delta_quantiles_p98", $("main").quantile($("delta_quantiles"), 0.98))]);
    });

    it("works with unique", () => {
      const attribute = AttributeInfo.fromJS({
        name: "unique_page",
        nativeType: "hyperUnique",
        type: "STRING"
      });
      const measures = measuresFromAttributeInfo(attribute);
      expect(measures).to.deep.equal([createMeasure("unique_page", $("main").countDistinct($("unique_page")))]);
    });

    it("works with theta", () => {
      const attribute = AttributeInfo.fromJS({
        name: "page_theta",
        nativeType: "thetaSketch",
        type: "STRING"
      });
      const measures = measuresFromAttributeInfo(attribute);
      expect(measures).to.deep.equal([createMeasure("page_theta", $("main").countDistinct($("page_theta")))]);
    });

    it("works with hll", () => {
      const attribute = AttributeInfo.fromJS({
        name: "page_hll",
        nativeType: "HLLSketch",
        type: "STRING"
      });
      const measures = measuresFromAttributeInfo(attribute);
      expect(measures).to.deep.equal([createMeasure("page_hll", $("main").countDistinct($("page_hll")))]);
    });

  });

  // TODO: move to ConcreteSeries !!!
  describe.skip("toApplyExpression", () => {
    //
    // describe("no transformation", () => {
    //   const nestingLevels = [0, 1, 99];
    //
    //   nestingLevels.forEach(nestingLevel => {
    //     it(`creates simple formula expression at level: ${nestingLevel}`, () => {
    //       const applyExpression = MeasureFixtures.noTransformationMeasure().toApplyExpression(nestingLevel);
    //       expect(applyExpression.toJS()).to.deep.equal(MeasureFixtures.applyWithNoTransformation());
    //     });
    //   });
    // });
    //
    // describe("percent-of-parent transformation", () => {
    //   const tests = [
    //     { nestingLevel: 0, expression: MeasureFixtures.applyWithTransformationAtRootLevel() },
    //     { nestingLevel: 1, expression: MeasureFixtures.applyWithTransformationAtLevel(1) },
    //     { nestingLevel: 99, expression: MeasureFixtures.applyWithTransformationAtLevel(1) }
    //   ];
    //
    //   tests.forEach(test => {
    //     it(`creates correct formula expression at level: ${test.nestingLevel}`, () => {
    //       const applyExpression = MeasureFixtures.percentOfParentMeasure().toApplyExpression(test.nestingLevel);
    //       expect(applyExpression.toJS()).to.deep.equal(test.expression);
    //     });
    //   });
    // });
    //
    // describe("percent-of-total transformation", () => {
    //   const tests = [
    //     { nestingLevel: 0, expression: MeasureFixtures.applyWithTransformationAtRootLevel() },
    //     { nestingLevel: 1, expression: MeasureFixtures.applyWithTransformationAtLevel(1) },
    //     { nestingLevel: 99, expression: MeasureFixtures.applyWithTransformationAtLevel(99) }
    //   ];
    //
    //   tests.forEach(test => {
    //     it(`creates correct formula expression at level: ${test.nestingLevel}`, () => {
    //       const applyExpression = MeasureFixtures.percentOfTotalMeasure().toApplyExpression(test.nestingLevel);
    //       expect(applyExpression.toJS()).to.deep.equal(test.expression);
    //     });
    //   });
    // });
  });
});
