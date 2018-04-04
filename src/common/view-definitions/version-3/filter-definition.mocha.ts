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
import { $, r } from "plywood";
import { FilterClause } from "../../models";
import { DataCubeMock } from "../../models/data-cube/data-cube.mock";
import { filterDefinitionConverter, StringFilterAction } from "./filter-definition";
import { FilterDefinitionFixtures } from "./filter-definition.fixtures";

describe("FilterDefinition v3", () => {
  describe("string filter conversion", () => {
    const stringFilterTests = [
      { dimension: "channel", action: StringFilterAction.in, exclude: false, values: ["en", "pl"] },
      { dimension: "channel", action: StringFilterAction.in, exclude: true, values: ["en", "pl"] },
      { dimension: "channel", action: StringFilterAction.contains, exclude: false, values: ["en"] },
      { dimension: "channel", action: StringFilterAction.match, exclude: false, values: ["^en$"] }
    ];

    stringFilterTests.forEach(({ dimension, action, exclude, values }) => {
      it(`should convert model with ${action} action`, () => {
        const filterClause = filterDefinitionConverter.toFilterClause(FilterDefinitionFixtures.stringFilterClauseDefinition(dimension, action, exclude, values), DataCubeMock.wiki());
        const expected = FilterDefinitionFixtures.stringFilterClause(dimension, action, exclude, values);

        expect(filterClause.toJS()).to.deep.equal(expected.toJS());
      });
    });
  });

  describe("time filter conversion", () => {
    it("should convert", () => {
      // const selection = r({ start: "2018-01-01T00:00:00", end: "2018-01-02T00:00:00", type: "TIME_RANGE"});
      // const selection = $(FilterClause.NOW_REF_NAME).timeRange("P1D", -1);
      const selection = r({ start: 1, end: null, type: "NUMBER_RANGE" });
      const filterClause = new FilterClause({ expression: $("time"), action: null, selection, exclude: false });
      const filter = filterDefinitionConverter.fromFilterClause(filterClause, DataCubeMock.wiki());
      console.log(filter);
    });
  });
});
