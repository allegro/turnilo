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
    it("converts to default essence", () => {
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

    it("reads string split", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(stringSplitDefinition("string_a")),
        mockEssenceWithSplits(stringSplitCombine("string_a")));
    });

    it("reads string split with sort on measure", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(stringSplitDefinition("string_a", "count")),
        mockEssenceWithSplits(stringSplitCombine("string_a", "count")));
    });

    it("reads string split with descending sort", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(stringSplitDefinition("string_a", "string_a", SortDirection.descending)),
        mockEssenceWithSplits(stringSplitCombine("string_a", "string_a", SortDirection.descending)));
    });

    it("reads string split with limit", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(stringSplitDefinition("string_a", "string_a", SortDirection.descending, 10)),
        mockEssenceWithSplits(stringSplitCombine("string_a", "string_a", SortDirection.descending, 10)));
    });

    it("reads time split", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(timeSplitDefinition("time", "P1D")),
        mockEssenceWithSplits(timeSplitCombine("time", "P1D")));
    });

    it("reads time split with granularity", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(timeSplitDefinition("time", "PT2M")),
        mockEssenceWithSplits(timeSplitCombine("time", "PT2M")));
    });

    it("reads number split", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(numberSplitDefinition("numeric", 100)),
        mockEssenceWithSplits(numberSplitCombine("numeric", 100)));
    });

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
  });

  describe("Series", () => {
    const mockViewDefinitionWithSeries = (...series: SeriesDefinition[]) =>
      mockViewDefinition({ series });

    const mockEssenceWithSeries = (...series: Series[]) =>
      mockEssence({ series: SeriesList.fromSeries(series) });

    it("reads simple series", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSeries(fromReference("count")),
        mockEssenceWithSeries(measureSeries("count")));
    });

    it("reads multiple simple series", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSeries(fromReference("count"), fromReference("sum")),
        mockEssenceWithSeries(measureSeries("count"), measureSeries("sum")));
    });

    it("reads measure series", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSeries(measureSeriesDefinition("count")),
        mockEssenceWithSeries(measureSeries("count")));
    });

    it("reads measure series with custom format", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSeries(measureSeriesDefinition("sum", PERCENT_FORMAT)),
        mockEssenceWithSeries(measureSeries("sum", PERCENT_FORMAT)));
    });

    it("reads quantile series", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSeries(quantileSeriesDefinition("quantile")),
        mockEssenceWithSeries(quantileSeries("quantile")));
    });

    it("reads quantile series with custom percentile", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSeries(quantileSeriesDefinition("quantile", 90)),
        mockEssenceWithSeries(quantileSeries("quantile", 90)));
    });

    it("infers quantile series from reference to measure that has quantile expression", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSeries(fromReference("quantile")),
        mockEssenceWithSeries(quantileSeries("quantile")));
    });
  });
});
