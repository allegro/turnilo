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
import { DataCubeFixtures } from "../../models/data-cube/data-cube.fixtures";
import { DimensionFixtures } from "../../models/dimension/dimension.fixtures";
import { SplitFixtures } from "../../models/split/split.fixtures";
import { SortDirection, splitConverter } from "./split-definition";
import { SplitDefinitionFixtures } from "./split-definition.fixtures";

describe("SplitDefinition v3", () => {
  describe("string split conversion", () => {
    const converter = splitConverter;

    const stringSplitTests = [
      { dimension: DimensionFixtures.wikiChannel(), sortOn: "channel", sortDirection: SortDirection.ascending, limit: 5 },
      { dimension: DimensionFixtures.wikiChannel(), sortOn: "count", sortDirection: SortDirection.descending, limit: 15 }
    ];

    stringSplitTests.forEach(({ dimension, sortOn, sortDirection, limit }) => {
      it(`should convert model sorted ${sortDirection} on ${sortOn} with limit ${limit}`, () => {
        const splitDefinition = SplitDefinitionFixtures.stringSplitDefinition(dimension.name, sortOn, sortDirection, limit);
        const splitCombine = converter.toSplitCombine(splitDefinition, DataCubeFixtures.wiki());
        const expectedSplitCombine = SplitFixtures.stringSplitCombine(dimension, sortOn, sortDirection, limit);

        expect(splitCombine.toJS()).to.deep.equal(expectedSplitCombine.toJS());
      });
    });
  });
});
