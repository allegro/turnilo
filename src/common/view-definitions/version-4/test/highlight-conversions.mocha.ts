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

import { StringFilterAction } from "../../../models/filter-clause/filter-clause";
import { stringIn } from "../../../models/filter-clause/filter-clause.fixtures";
import { Filter } from "../../../models/filter/filter";
import { Highlight } from "../../../models/highlight/highlight";
import { mockEssence } from "../../test/essence.fixture";
import { FilterClauseDefinition } from "../filter-definition";
import { stringFilterDefinition } from "../filter-definition.fixtures";
import { mockViewDefinition } from "../view-definition-4.fixture";
import { assertConversionToEssence } from "./utils";

const mockViewDefinitionWithHighlight = (measure: string, ...filters: FilterClauseDefinition[]) =>
  mockViewDefinition({ highlight: { filters, measure } });

const mockEssenceWithHighlight = (measure: string, delta: Filter) =>
  mockEssence({ highlight: new Highlight({ measure, delta }) });

const essenceWithEmptyHighlight = mockEssence({ highlight: null });

describe("Highlight", () => {
  it("omits empty highlight", () => {
    assertConversionToEssence(
      mockViewDefinition({ highlight: null }),
      essenceWithEmptyHighlight);
  });

  it("reads highlight", () => {
    assertConversionToEssence(
      mockViewDefinitionWithHighlight("count", stringFilterDefinition("string_a", StringFilterAction.IN, ["foobar"])),
      mockEssenceWithHighlight("count", Filter.fromClause(stringIn("string_a", ["foobar"]))));
  });

  it("resets highlight on non existing series", () => {
    assertConversionToEssence(
      mockViewDefinitionWithHighlight("qvux", stringFilterDefinition("string_a", StringFilterAction.IN, ["foobar"])),
      essenceWithEmptyHighlight);
  });

  it.skip("omits highlight delta clause on non existing dimension", () => {
    assertConversionToEssence(
      mockViewDefinitionWithHighlight("count",
        stringFilterDefinition("string_a", StringFilterAction.IN, ["qvux"]),
        stringFilterDefinition("foobar", StringFilterAction.IN, ["bazz"])),
      mockEssenceWithHighlight("count", Filter.fromClause(stringIn("string_a", ["qvux"]))));
  });

  it("resets highlight without delta clauses", () => {
    assertConversionToEssence(
      mockViewDefinition({ highlight: { filters: [], measure: "count" } }),
      essenceWithEmptyHighlight);
  });

  it.skip("resets highlight when no valid clause found", () => {
    assertConversionToEssence(
      mockViewDefinitionWithHighlight("count", stringFilterDefinition("foobar", StringFilterAction.IN, ["bazz"])),
      essenceWithEmptyHighlight);
  });
});
