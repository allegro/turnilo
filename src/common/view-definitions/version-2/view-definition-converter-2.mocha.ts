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
import { EssenceJS } from "../../models";
import { DataCubeFixtures } from "../../models/data-cube/data-cube.fixtures";
import { FilterClauseFixtures } from "../../models/filter-clause/filter-clause.fixtures";
import { ViewDefinitionConverter2 } from "./view-definition-converter-2";

describe("ViewDefinitionConverter2", () => {

  const totalsWithTimeBucket: EssenceJS = {
    visualization: "totals",
    timezone: "Etc/UTC",
    filter: {
      op: "overlap",
      operand: {
        op: "ref",
        name: "time"
      },
      expression: {
        op: "timeBucket",
        operand: {
          op: "ref",
          name: "n"
        },
        duration: "P1D"
      }
    },
    splits: [],
    singleMeasure: "delta",
    selectedMeasures: [
      "count"
    ],
    pinnedDimensions: [],
    multiMeasureMode: true,
    pinnedSort: "delta"
  };

  it("should convert time bucket expression to time range", () => {
    const essence = new ViewDefinitionConverter2().fromViewDefinition(totalsWithTimeBucket, DataCubeFixtures.wiki(), MANIFESTS);
    const convertedClause = essence.filter.clauses.first();

    const currentDuration = 1;
    const expectedClause = FilterClauseFixtures.timeDurationFloored("time", currentDuration, "P1D");
    expect(convertedClause).to.deep.equal(expectedClause);
  });
});
