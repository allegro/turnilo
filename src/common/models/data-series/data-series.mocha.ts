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
import { DataCubeFixtures } from "../data-cube/data-cube.fixtures";
import { FilterFixtures } from "../filter/filter.fixtures";
import { MeasureFixtures } from "../measure/measure.fixtures";
import { customFormat, EXACT_FORMAT, PERCENT_FORMAT, SeriesDerivation } from "../series/series";
import { CurrentPeriod, DataSeries, DataSeriesPercentOf, PreviousPeriod } from "./data-series";
import { nominalName } from "./data-series-names";
import { DataSeriesFixtures } from "./data-series.fixtures";
import { DataSeriesExpressionSnapshots } from "./data-series.snapshots";

describe("DataSeries", () => {
  describe("toExpression", () => {
    describe("periods", () => {
      it("creates expression for current period", () => {
        const start = new Date(30 * 86400);
        const end = new Date(40 * 86400);
        const filter = FilterFixtures.timeAttributeFilter(start, end).toExpression(DataCubeFixtures.wiki());
        const exp = DataSeriesFixtures.itemsSeries().toExpression(0, new CurrentPeriod(filter));
        expect(exp.toJS()).to.deep.eq(DataSeriesExpressionSnapshots.itemInCurrentPeriod(start, end));
      });

      it("creates expression for previous period", () => {
        const end = new Date(20 * 86400);
        const start = new Date(10 * 86400);
        const filter = FilterFixtures.timeAttributeFilter(start, end).toExpression(DataCubeFixtures.wiki());
        const exp = DataSeriesFixtures.itemsSeries().toExpression(0, new PreviousPeriod(filter));
        expect(exp.toJS()).to.deep.eq(DataSeriesExpressionSnapshots.itemInPreviousPeriod(start, end));
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
      it(`fullName/nominalName is isomorphic for derivation ${derivation} and percentOf ${percentOf}`, () => {
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
    const series = new DataSeries({ measure: MeasureFixtures.wikiCount() });
    const datum = { [series.fullName()]: 123456.987654 };

    it("should format with default format", () => {
      expect(series.formatValue(datum)).to.be.eq("123.5 k");
    });

    it("should format with exact format", () => {
      expect(series.set("format", EXACT_FORMAT).formatValue(datum)).to.be.eq("123,456.987654");
    });

    it("should format with percent format", () => {
      expect(series.set("format", PERCENT_FORMAT).formatValue(datum)).to.be.eq("12345698.77%");
    });

    it("should format with custom format", () => {
      expect(series.set("format", customFormat("0,0.0")).formatValue(datum)).to.be.eq("123,457.0");
    });
  });

  describe("get from datum", () => {
    const series = new DataSeries({ measure: MeasureFixtures.wikiCount() });
    const datum = {
      [series.fullName()]: 100,
      [series.fullName(SeriesDerivation.PREVIOUS)]: 20
    };

    it("should get current value", () => {
      expect(series.selectValue(datum)).to.eq(100);
    });

    it("should get previous value", () => {
      expect(series.selectValue(datum, SeriesDerivation.PREVIOUS)).to.eq(20);
    });

    it("should get current value", () => {
      expect(series.selectValue(datum, SeriesDerivation.DELTA)).to.eq(80);
    });
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
