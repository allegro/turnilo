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
import { SeriesDerivation } from "../../../models/series/concrete-series";
import { SortDirection } from "../../../models/sort/sort";
import { Split } from "../../../models/split/split";
import { numberSplitCombine, stringSplitCombine, timeSplitCombine } from "../../../models/split/split.fixtures";
import { Splits } from "../../../models/splits/splits";
import { TABLE_MANIFEST } from "../../../visualization-manifests/table/table";
import { assertEqlEssenceWithoutVisResolve } from "../../test/assertions";
import { mockEssence } from "../../test/essence.fixture";
import { mockViewDefinition } from "../../test/view-definition.fixture";
import { SplitDefinition } from "../split-definition";
import { numberSplitDefinition, stringSplitDefinition, timeSplitDefinition } from "../split-definition.fixtures";
import { assertConversionToEssence, toEssence } from "./utils";

describe("Splits", () => {
  const mockViewDefinitionWithSplits = (...splits: SplitDefinition[]) =>
    mockViewDefinition({
      splits,
      visualization: TABLE_MANIFEST.name,
      visualizationSettings: null
    });

  const mockEssenceWithSplits = (...splits: Split[]) =>
    mockEssence({
      splits: Splits.fromSplits(splits),
      visualization: TABLE_MANIFEST,
      visualizationSettings: TABLE_MANIFEST.visualizationSettings.defaults
    });

  describe("String Dimensions", () => {
    it("reads basic split", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(stringSplitDefinition("string_a")),
        mockEssenceWithSplits(stringSplitCombine("string_a")));
    });

    it("reads split with sort on measure", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(stringSplitDefinition("string_a", { sort: { reference: "count" } })),
        mockEssenceWithSplits(stringSplitCombine("string_a", { sort: { reference: "count" } })));
    });

    it("reads split with sort on measure in previous period", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(stringSplitDefinition("string_a", { sort: { reference: "count", period: SeriesDerivation.PREVIOUS } })),
        mockEssenceWithSplits(stringSplitCombine("string_a", { sort: { reference: "count", period: SeriesDerivation.PREVIOUS } })));
    });

    it("reads split with sort on measure in delta", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(stringSplitDefinition("string_a", { sort: { reference: "count", period: SeriesDerivation.DELTA } })),
        mockEssenceWithSplits(stringSplitCombine("string_a", { sort: { reference: "count", period: SeriesDerivation.DELTA } })));
    });

    it("reads split with descending sort", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(stringSplitDefinition("string_a", { sort: { direction: SortDirection.descending } })),
        mockEssenceWithSplits(stringSplitCombine("string_a", { sort: { direction: SortDirection.descending } })));
    });

    it("reads split with limit", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(stringSplitDefinition("string_a", { limit: 10 })),
        mockEssenceWithSplits(stringSplitCombine("string_a", { limit: 10 })));
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
        mockViewDefinitionWithSplits(timeSplitDefinition("time", "P1D", { sort: { reference: "count" } })),
        mockEssenceWithSplits(timeSplitCombine("time", "P1D", { sort: { reference: "count" } })));
    });

    it("reads split with sort on measure in previous period", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(timeSplitDefinition("time", "P1D", { sort: { reference: "count", period: SeriesDerivation.PREVIOUS } })),
        mockEssenceWithSplits(timeSplitCombine("time", "P1D", { sort: { reference: "count", period: SeriesDerivation.PREVIOUS } })));
    });

    it("reads split with sort on measure in delta", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(timeSplitDefinition("time", "P1D", { sort: { reference: "count", period: SeriesDerivation.DELTA } })),
        mockEssenceWithSplits(timeSplitCombine("time", "P1D", { sort: { reference: "count", period: SeriesDerivation.DELTA } })));
    });

    it("reads split with descending sort", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(timeSplitDefinition("time", "P1D", { sort: { direction: SortDirection.descending } })),
        mockEssenceWithSplits(timeSplitCombine("time", "P1D", { sort: { direction: SortDirection.descending } })));
    });

    it("reads split with limit", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(timeSplitDefinition("time", "P1D", { limit: 10 })),
        mockEssenceWithSplits(timeSplitCombine("time", "P1D", { limit: 10 })));
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
        mockViewDefinitionWithSplits(numberSplitDefinition("numeric", 100, { sort: { reference: "count" } })),
        mockEssenceWithSplits(numberSplitCombine("numeric", 100, { sort: { reference: "count" } })));
    });

    it("reads split with sort on measure in previous period", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(numberSplitDefinition("numeric", 100, { sort: { reference: "count", period: SeriesDerivation.PREVIOUS } })),
        mockEssenceWithSplits(numberSplitCombine("numeric", 100, { sort: { reference: "count", period: SeriesDerivation.PREVIOUS } })));
    });

    it("reads split with sort on measure in delta", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(numberSplitDefinition("numeric", 100, { sort: { reference: "count", period: SeriesDerivation.DELTA } })),
        mockEssenceWithSplits(numberSplitCombine("numeric", 100, { sort: { reference: "count", period: SeriesDerivation.DELTA } })));
    });

    it("reads split with descending sort", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(numberSplitDefinition("numeric", 100, { sort: { direction: SortDirection.descending } })),
        mockEssenceWithSplits(numberSplitCombine("numeric", 100, { sort: { direction: SortDirection.descending } })));
    });

    it("reads split with limit", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(numberSplitDefinition("numeric", 100, { limit: 10 })),
        mockEssenceWithSplits(numberSplitCombine("numeric", 100, { limit: 10 })));
    });
  });

  describe("Legacy previous/delta sort reference", () => {
    it("reads previous sort reference", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(stringSplitDefinition("string_a", { sort: { reference: "_previous__count" } })),
        mockEssenceWithSplits(stringSplitCombine("string_a", { sort: { reference: "count", period: SeriesDerivation.PREVIOUS } })));
    });

    it("reads delta sort reference", () => {
      assertConversionToEssence(
        mockViewDefinitionWithSplits(stringSplitDefinition("string_a", { sort: { reference: "_delta__count" } })),
        mockEssenceWithSplits(stringSplitCombine("string_a", { sort: { reference: "count", period: SeriesDerivation.DELTA } })));
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
        mockViewDefinitionWithSplits(stringSplitDefinition("string_a"), stringSplitDefinition("string_b", { sort: { reference: "foobar-dimension" } })),
        mockEssenceWithSplits(stringSplitCombine("string_a")));
    });

    it.skip("omits split on single non existing dimension and advises visualisation change", () => {
      const viewDefinition = mockViewDefinitionWithSplits(stringSplitDefinition("foobar-dimension"));
      const essence = mockEssenceWithSplits();
      const resultEssence = toEssence(viewDefinition);
      assertEqlEssenceWithoutVisResolve(resultEssence, essence);
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
