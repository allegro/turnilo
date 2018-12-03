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
import { MeasureFixtures } from "../measure/measure.fixtures";
import { SeriesDerivation } from "../series/series";
import { DataSeries, DataSeriesPercentOf } from "./data-series";
import { nominalName } from "./data-series-names";
import { DataSeriesFixtures } from "./data-series.fixtures";
import { DataSeriesExpressionSnapshots } from "./data-series.snapshots";

describe("DataSeries", () => {
  describe("toExpression", () => {
    describe("periods", () => {
      it("creates expression for current period", () => {

      });
    });

    describe("percent-of", () => {
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
  });

  describe("series name", () => {
    const measure = MeasureFixtures.wikiCount();
    const tests = [
      { percentOf: undefined, derivation: undefined },
      { percentOf: undefined, derivation: SeriesDerivation.CURRENT },
      { percentOf: undefined, derivation: SeriesDerivation.PREVIOUS },
      { percentOf: undefined, derivation: SeriesDerivation.DELTA },
      { percentOf: DataSeriesPercentOf.PARENT, derivation: undefined },
      { percentOf: DataSeriesPercentOf.PARENT, derivation: SeriesDerivation.CURRENT },
      { percentOf: DataSeriesPercentOf.PARENT, derivation: SeriesDerivation.PREVIOUS },
      { percentOf: DataSeriesPercentOf.PARENT, derivation: SeriesDerivation.DELTA },
      { percentOf: DataSeriesPercentOf.TOTAL, derivation: undefined },
      { percentOf: DataSeriesPercentOf.TOTAL, derivation: SeriesDerivation.CURRENT },
      { percentOf: DataSeriesPercentOf.TOTAL, derivation: SeriesDerivation.PREVIOUS },
      { percentOf: DataSeriesPercentOf.TOTAL, derivation: SeriesDerivation.DELTA }
    ];

    tests.forEach(({ percentOf, derivation }) => {
      it("fullName/nominalName is isomorphic", () => {
        const series = new DataSeries({ measure, percentOf });
        const fullName = series.fullName(derivation);
        const { derivation: nominalDerivation, name, percentOf: nominalPercent } = nominalName(fullName);
        expect(nominalDerivation).to.eq(derivation || SeriesDerivation.CURRENT);
        expect(name).to.eq(measure.name);
        expect(nominalPercent).to.eq(percentOf);
      });
    });
  });

  describe("datum formatter", () => {

  });

  describe("datum getter", () => {

  });

  describe("title", () => {
    const measure = MeasureFixtures.wikiCount();
    const tests = [
      { percentOf: null, derivation: undefined, title: "Count" },
      { percentOf: null, derivation: SeriesDerivation.CURRENT, title: "Count" },
      { percentOf: null, derivation: SeriesDerivation.PREVIOUS, title: "Previous Count" },
      { percentOf: null, derivation: SeriesDerivation.DELTA, title: "Difference Count" },
      { percentOf: DataSeriesPercentOf.PARENT, derivation: undefined, title: "Count (% of Parent)" },
      { percentOf: DataSeriesPercentOf.PARENT, derivation: SeriesDerivation.CURRENT, title: "Count (% of Parent)" },
      { percentOf: DataSeriesPercentOf.PARENT, derivation: SeriesDerivation.PREVIOUS, title: "Previous Count (% of Parent)" },
      { percentOf: DataSeriesPercentOf.PARENT, derivation: SeriesDerivation.DELTA, title: "Difference Count (% of Parent)" },
      { percentOf: DataSeriesPercentOf.TOTAL, derivation: undefined, title: "Count (% of Total)" },
      { percentOf: DataSeriesPercentOf.TOTAL, derivation: SeriesDerivation.CURRENT, title: "Count (% of Total)" },
      { percentOf: DataSeriesPercentOf.TOTAL, derivation: SeriesDerivation.PREVIOUS, title: "Previous Count (% of Total)" },
      { percentOf: DataSeriesPercentOf.TOTAL, derivation: SeriesDerivation.DELTA, title: "Difference Count (% of Total)" }
    ];

    tests.forEach(({ percentOf, derivation, title }) => {
      it("creates title", () => {
        const series = new DataSeries({ measure, percentOf });
        expect(series.title(derivation)).to.eq(title);
      });
    });
  });
});
