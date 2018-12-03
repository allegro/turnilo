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
import { DataSeriesPercentOf } from "./data-series";
import { DataSeriesFixtures } from "./data-series.fixtures";
import { DataSeriesExpressionSnapshots } from "./data-series.snapshots";

describe("DataSeries", () => {
  describe("toExpression", () => {
    describe("no transformation", () => {
      const nestingLevels = [0, 1, 99];

      nestingLevels.forEach(nestingLevel => {
        it(`creates simple formula expression at level: ${nestingLevel}`, () => {
          const exp = DataSeriesFixtures.itemsSeries().toExpression(nestingLevel);
          expect(exp.toJS()).to.deep.equal(DataSeriesExpressionSnapshots.itemsExpWithNoFormula());
        });
      });
    });

    describe("percent-of-parent", () => {
      const tests = [
        { nestingLevel: 0, expression: DataSeriesExpressionSnapshots.itemsExpWithFormulaAtRootLevel(DataSeriesPercentOf.PARENT) },
        { nestingLevel: 1, expression: DataSeriesExpressionSnapshots.itemsExpWithFormulaAtLevel(1, DataSeriesPercentOf.PARENT) },
        { nestingLevel: 99, expression: DataSeriesExpressionSnapshots.itemsExpWithFormulaAtLevel(1, DataSeriesPercentOf.PARENT) }
      ];

      tests.forEach(test => {
        it(`creates correct formula expression at level: ${test.nestingLevel}`, () => {
          const exp = DataSeriesFixtures.itemsSeries(DataSeriesPercentOf.PARENT).toExpression(test.nestingLevel);
          expect(exp.toJS()).to.deep.equal(test.expression);
        });
      });
    });

    describe("percent-of-total", () => {
      const tests = [
        { nestingLevel: 0, expression: DataSeriesExpressionSnapshots.itemsExpWithFormulaAtRootLevel(DataSeriesPercentOf.TOTAL) },
        { nestingLevel: 1, expression: DataSeriesExpressionSnapshots.itemsExpWithFormulaAtLevel(1, DataSeriesPercentOf.TOTAL) },
        { nestingLevel: 99, expression: DataSeriesExpressionSnapshots.itemsExpWithFormulaAtLevel(99, DataSeriesPercentOf.TOTAL) }
      ];

      tests.forEach(test => {
        it(`creates correct formula expression at level: ${test.nestingLevel}`, () => {
          const exp = DataSeriesFixtures.itemsSeries(DataSeriesPercentOf.TOTAL).toExpression(test.nestingLevel);
          expect(exp.toJS()).to.deep.equal(test.expression);
        });
      });
    });
  });

  describe("series name", () => {

  });

  describe("datum formatter", () => {

  });

  describe("datum getter", () => {

  });

  describe("title", () => {

  });
});
