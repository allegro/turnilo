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
import { SeriesDerivation } from "../../models/series/concrete-series";
import { SeriesSort, SortDirection } from "../../models/sort/sort";
import { SplitFixtures } from "../../models/split/split.fixtures";
import { splitConverter } from "./split-definition";
import { SplitDefinitionFixtures } from "./split-definition.fixtures";

describe("SplitDefinition v4", () => {
  describe("string split conversion", () => {
    const stringSplitTests = [
      { dimension: "channel", sortOn: "channel", sortDirection: SortDirection.ascending, limit: 5 },
      { dimension: "channel", sortOn: "count", sortDirection: SortDirection.descending, limit: 15 }
    ];

    stringSplitTests.forEach(({ dimension, sortOn, sortDirection, limit }) => {
      it(`should convert model sorted ${sortDirection} on ${sortOn} with limit ${limit}`, () => {
        const splitDefinition = SplitDefinitionFixtures.stringSplitDefinition(dimension, sortOn, sortDirection, limit);
        const splitCombine = splitConverter.toSplitCombine(splitDefinition);
        const expectedSplitCombine = SplitFixtures.stringSplitCombine(dimension, sortOn, sortDirection, limit);

        expect(splitCombine.toJS()).to.deep.equal(expectedSplitCombine.toJS());
      });
    });
  });

  describe("legacy previous/delta sort reference", () => {
    const legacySorts = [
      { dimension: "channel", sortOn: "_previous__count", expectedReference: "count", expectedPeriod: SeriesDerivation.PREVIOUS },
      { dimension: "channel", sortOn: "_delta__count", expectedReference: "count", expectedPeriod: SeriesDerivation.DELTA }
    ];

    legacySorts.forEach(({ dimension, sortOn, expectedReference, expectedPeriod }) => {
      it(`should infer period correctly for ${sortOn}`, () => {
        const splitDefinition = SplitDefinitionFixtures.stringSplitDefinition(dimension, sortOn);
        const splitCombine = splitConverter.toSplitCombine(splitDefinition);
        const { sort } = splitCombine;

        expect(sort).to.be.instanceOf(SeriesSort);
        const { reference, period } = sort as SeriesSort;
        expect(reference).to.be.eq(expectedReference);
        expect(period).to.be.eq(expectedPeriod);
      });
    });
  });
});
