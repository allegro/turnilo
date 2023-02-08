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

import { SeriesList } from "../../../models/series-list/series-list";
import { Series } from "../../../models/series/series";
import { PERCENT_FORMAT } from "../../../models/series/series-format";
import { measureSeries, quantileSeries } from "../../../models/series/series.fixtures";
import { mockEssence } from "../../test/essence.fixture";
import { mockViewDefinition } from "../../test/view-definition.fixture";
import { SeriesDefinition } from "../series-definition";
import { fromReference, measureSeriesDefinition, quantileSeriesDefinition } from "../series-definition.fixtures";
import { assertConversionToEssence } from "./utils";

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
    it("omits series for non existing measure", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSeries(fromReference("sum"), fromReference("foobar")),
        mockEssenceWithSeries(measureSeries("sum")));
    });

    it("omits measure series for non existing measure", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSeries(measureSeriesDefinition("sum"), measureSeriesDefinition("foobar")),
        mockEssenceWithSeries(measureSeries("sum")));
    });
  });
});
