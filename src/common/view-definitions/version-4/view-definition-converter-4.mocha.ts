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
import { MANIFESTS } from "../../manifests";
import { TABLE_MANIFEST } from "../../manifests/table/table";
import { Essence } from "../../models/essence/essence";
import { SeriesList } from "../../models/series-list/series-list";
import { Series } from "../../models/series/series";
import { PERCENT_FORMAT } from "../../models/series/series-format";
import { measureSeries, quantileSeries } from "../../models/series/series.fixtures";
import { SortDirection } from "../../models/sort/sort";
import { Split } from "../../models/split/split";
import { numberSplitCombine, stringSplitCombine, timeSplitCombine } from "../../models/split/split.fixtures";
import { Splits } from "../../models/splits/splits";
import { dataCube } from "../test/data-cube.fixture";
import { mockEssence } from "../test/essence.fixture";
import { count, quantile, sum } from "../test/measure";
import { SeriesDefinition } from "./series-definition";
import { fromReference, measureSeriesDefinition, quantileSeriesDefinition } from "./series-definition.fixtures";
import { SplitDefinition } from "./split-definition";
import { numberSplitDefinition, stringSplitDefinition, timeSplitDefinition } from "./split-definition.fixtures";
import { ViewDefinition4 } from "./view-definition-4";
import { mockViewDefinition } from "./view-definition-4.fixture";
import { ViewDefinitionConverter4 } from "./view-definition-converter-4";

const converter = new ViewDefinitionConverter4();
const toEssence = (viewDef: ViewDefinition4) => converter.fromViewDefinition(viewDef, dataCube, MANIFESTS);

function assertEqlEssence(actual: Essence, expected: Essence) {
  try {
    expect(actual.equals(expected)).to.be.true;
  } catch (e) {
    expect(actual.toJS()).to.deep.equal(expected.toJS());
    throw e;
  }
}

function assertConversionToEssence(viewDef: ViewDefinition4, essence: Essence) {
  assertEqlEssence(toEssence(viewDef), essence);
}

function assertEqlEssenceWithoutVisResolve(actual: Essence, expected: Essence) {
  assertEqlEssence(actual.set("visResolve", null), expected.set("visResolve", null));
}

describe("ViewDefinitionConverter4", () => {
  describe("Base case", () => {
    it("converts base view definition mock to base essence mock", () => {
      const result = toEssence(mockViewDefinition());
      const expected = mockEssence();
      assertEqlEssence(result, expected);
    });
  });

  describe("Splits", () => {
    const mockViewDefinitionWithSplits = (...splits: SplitDefinition[]) =>
      mockViewDefinition({ splits, visualization: TABLE_MANIFEST.name });

    const mockEssenceWithSplits = (...splits: Split[]) =>
      mockEssence({ splits: Splits.fromSplits(splits), visualization: TABLE_MANIFEST });

    describe("String Dimensions", () => {
      it("reads basic split", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSplits(stringSplitDefinition("string_a")),
          mockEssenceWithSplits(stringSplitCombine("string_a")));
      });

      it("reads split with sort on measure", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSplits(stringSplitDefinition("string_a", "count")),
          mockEssenceWithSplits(stringSplitCombine("string_a", "count")));
      });

      it("reads split with descending sort", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSplits(stringSplitDefinition("string_a", "string_a", SortDirection.descending)),
          mockEssenceWithSplits(stringSplitCombine("string_a", "string_a", SortDirection.descending)));
      });

      it("reads split with limit", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSplits(stringSplitDefinition("string_a", "string_a", SortDirection.descending, 10)),
          mockEssenceWithSplits(stringSplitCombine("string_a", "string_a", SortDirection.descending, 10)));
      });
    });

    describe("Time Dimension", () => {
      it("reads basic split", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSplits(timeSplitDefinition("time", "P1D")),
          mockEssenceWithSplits(timeSplitCombine("time", "P1D")));
      });

      it("reads split with granularity", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSplits(timeSplitDefinition("time", "PT2M")),
          mockEssenceWithSplits(timeSplitCombine("time", "PT2M")));
      });

      it("reads split with sort on measure", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSplits(timeSplitDefinition("time", "P1D", "count")),
          mockEssenceWithSplits(timeSplitCombine("time", "P1D", "count")));
      });

      it("reads split with descending sort", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSplits(timeSplitDefinition("time", "P1D", "time", SortDirection.descending)),
          mockEssenceWithSplits(timeSplitCombine("time", "P1D", "time", SortDirection.descending)));
      });

      it("reads split with limit", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSplits(timeSplitDefinition("time", "P1D", "time", SortDirection.descending, 10)),
          mockEssenceWithSplits(timeSplitCombine("time", "P1D", "time", SortDirection.descending, 10)));
      });
    });

    describe("Numeric Dimensions", () => {
      it("reads basic split", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSplits(numberSplitDefinition("numeric", 100)),
          mockEssenceWithSplits(numberSplitCombine("numeric", 100)));
      });

      it("reads split with sort on measure", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSplits(numberSplitDefinition("numeric", 100, "count")),
          mockEssenceWithSplits(numberSplitCombine("numeric", 100, "count")));
      });

      it("reads split with descending sort", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSplits(numberSplitDefinition("numeric", 100, "numeric", SortDirection.descending)),
          mockEssenceWithSplits(numberSplitCombine("numeric", 100, "numeric", SortDirection.descending)));
      });

      it("reads split with limit", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSplits(numberSplitDefinition("numeric", 100, "numeric", SortDirection.descending, 10)),
          mockEssenceWithSplits(numberSplitCombine("numeric", 100, "numeric", SortDirection.descending, 10)));
      });
    });

    describe("Edge cases", () => {
      it("omits split on non existing dimension", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSplits(stringSplitDefinition("string_a"), stringSplitDefinition("foobar-dimension")),
          mockEssenceWithSplits(stringSplitCombine("string_a")));
      });

      it("omits dimension with non existing sort reference", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSplits(stringSplitDefinition("string_a"), stringSplitDefinition("string_b", "foobar-dimension")),
          mockEssenceWithSplits(stringSplitCombine("string_a")));
      });

      it.skip("omits split on single non existing dimension and advises visualisation change", () => {
        const viewDefinition = mockViewDefinitionWithSplits(stringSplitDefinition("foobar-dimension"));
        const essence = mockEssenceWithSplits();
        const resultEssence = toEssence(viewDefinition);
        assertEqlEssence(resultEssence, essence);
        // TODO:
        /*
          Currently we run visResolve before constraining splits
          In this case that means that we satisfy predicate with at least one split.
          But in next step we will remove it and we get "valid" Table without splits.
         */
        expect(resultEssence.visResolve.isManual()).to.be.true;
      });
    });
  });

  describe("Series", () => {
    const mockViewDefinitionWithSeries = (...series: SeriesDefinition[]) =>
      mockViewDefinition({ series });

    const mockEssenceWithSeries = (...series: Series[]) =>
      mockEssence({ series: SeriesList.fromSeries(series) });

    describe("Just reference in Definition", () => {
      it("reads single series", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSeries(fromReference("count")),
          mockEssenceWithSeries(measureSeries("count")));
      });

      it("reads multiple series", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSeries(fromReference("count"), fromReference("sum")),
          mockEssenceWithSeries(measureSeries("count"), measureSeries("sum")));
      });

      it("infers quantile series from reference to measure that has quantile expression", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSeries(fromReference("quantile")),
          mockEssenceWithSeries(quantileSeries("quantile")));
      });
    });

    describe("Measure Series", () => {
      it("reads series", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSeries(measureSeriesDefinition("count")),
          mockEssenceWithSeries(measureSeries("count")));
      });

      it("reads series with custom format", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSeries(measureSeriesDefinition("sum", PERCENT_FORMAT)),
          mockEssenceWithSeries(measureSeries("sum", PERCENT_FORMAT)));
      });
    });

    describe("Quantile series", () => {
      it("reads series", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSeries(quantileSeriesDefinition("quantile")),
          mockEssenceWithSeries(quantileSeries("quantile")));
      });

      it("reads series with custom format", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSeries(quantileSeriesDefinition("quantile", 90, PERCENT_FORMAT)),
          mockEssenceWithSeries(quantileSeries("quantile", 90, PERCENT_FORMAT)));
      });

      it("reads series with custom percentile", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSeries(quantileSeriesDefinition("quantile", 90)),
          mockEssenceWithSeries(quantileSeries("quantile", 90)));
      });

      it.skip("omit quantile series referencing non quantile measure", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSeries(fromReference("sum"), quantileSeriesDefinition("count")),
          mockEssenceWithSeries(measureSeries("sum")));
      });
    });

    describe.skip("Edge cases", () => {
      it("omits series for existing measure", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSeries(fromReference("sum"), fromReference("foobar")),
          mockEssenceWithSeries(measureSeries("sum")));
      });

      it("omits measure series for existing measure", () => {
        assertConversionToEssence(
          mockViewDefinitionWithSeries(measureSeriesDefinition("sum"), measureSeriesDefinition("foobar")),
          mockEssenceWithSeries(measureSeries("sum")));
      });
    });
  });
});
