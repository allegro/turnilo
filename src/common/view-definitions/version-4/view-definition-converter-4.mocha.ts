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
import { PERCENT_FORMAT } from "../../models/series/series-format";
import { measureSeries, quantileSeries } from "../../models/series/series.fixtures";
import { SortDirection } from "../../models/sort/sort";
import { Split } from "../../models/split/split";
import { numberSplitCombine, stringSplitCombine, timeSplitCombine } from "../../models/split/split.fixtures";
import { Splits } from "../../models/splits/splits";
import { dataCube } from "../test/data-cube.fixture";
import { mockEssence } from "../test/essence.fixture";
import { count, quantile, sum } from "../test/measure";
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
    it("reads simple series", () => {
      const result = toEssence(mockViewDefinition({
        series: [fromReference("count")]
      }));
      const expected = mockEssence({
        series: SeriesList.fromSeries([measureSeries("count")])
      });
      assertEqlEssence(result, expected);
    });

    it("reads multiple simple series", () => {
      const result = toEssence(mockViewDefinition({
        series: [
          fromReference("count"),
          fromReference("sum")
        ]
      }));
      const expected = mockEssence({
        series: SeriesList.fromSeries([
          measureSeries("count"),
          measureSeries("sum")
        ])
      });
      assertEqlEssence(result, expected);
    });

    it("reads measure series", () => {
      const result = toEssence(mockViewDefinition({
        series: [measureSeriesDefinition("sum")]
      }));
      const expected = mockEssence({
        series: SeriesList.fromSeries([measureSeries("sum")])
      });
      assertEqlEssence(result, expected);
    });

    it("reads measure series with custom format", () => {
      const result = toEssence(mockViewDefinition({
        series: [measureSeriesDefinition("sum", PERCENT_FORMAT)]
      }));
      const expected = mockEssence({
        series: SeriesList.fromSeries([measureSeries("sum", PERCENT_FORMAT)])
      });
      assertEqlEssence(result, expected);
    });

    it("reads quantile series", () => {
      const result = toEssence(mockViewDefinition({
        series: [quantileSeriesDefinition("quantile")]
      }));
      const expected = mockEssence({
        series: SeriesList.fromSeries([quantileSeries("quantile")])
      });
      assertEqlEssence(result, expected);
    });

    it("reads quantile series with custom percentile", () => {
      const result = toEssence(mockViewDefinition({
        series: [quantileSeriesDefinition("quantile", 90)]
      }));
      const expected = mockEssence({
        series: SeriesList.fromSeries([quantileSeries("quantile", 90)])
      });
      assertEqlEssence(result, expected);
    });

    it("infers quantile series from reference to measure that has quantile expression", () => {
      const result = toEssence(mockViewDefinition({
        series: [fromReference("quantile")]
      }));
      const expected = mockEssence({
        series: SeriesList.fromSeries([quantileSeries("quantile")])
      });
      assertEqlEssence(result, expected);
    });
  });
});
