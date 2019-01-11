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
import { DataCubeFixtures } from "../../models/data-cube/data-cube.fixtures";
import { TimeFilterPeriod } from "../../models/filter-clause/filter-clause";
import { FilterClauseFixtures } from "../../models/filter-clause/filter-clause.fixtures";
import { ViewDefinition2 } from "./view-definition-2";
import { ViewDefinitionConverter2 } from "./view-definition-converter-2";

const currentDay = {
  op: "timeBucket",
  operand: {
    op: "ref",
    name: "n"
  },
  duration: "P1D"
};

const previousDay = {
  op: "timeRange",
  operand: {
    op: "timeFloor",
    operand:
      {
        op: "ref",
        name: "n"
      },
    duration: "P1D"
  },
  duration: "P1D",
  step: -1
};

const latestDay = {
  op: "timeRange",
  operand: {
    op: "ref",
    name: "m"
  },
  duration: "P1D",
  step: -1
};

const totalsWithPeriod = (period: any): ViewDefinition2 => ({
  visualization: "totals",
  timezone: "Etc/UTC",
  filter: {
    op: "overlap",
    operand: {
      op: "ref",
      name: "time"
    },
    expression: period
  },
  splits: [],
  singleMeasure: "delta",
  multiMeasureMode: true,
  selectedMeasures: ["count"],
  pinnedDimensions: [],
  pinnedSort: "delta"
});

describe("ViewDefinitionConverter2", () => {

  [
    { label: "current day", expression: currentDay, period: TimeFilterPeriod.CURRENT },
    { label: "previous day", expression: previousDay, period: TimeFilterPeriod.PREVIOUS },
    { label: "latest day", expression: latestDay, period: TimeFilterPeriod.LATEST }
  ].forEach(({ label, expression, period }) => {
    it(`should convert time filter clause with ${label}`, () => {
      const totalsWithTimeBucket: ViewDefinition2 = totalsWithPeriod(expression);
      const essence = new ViewDefinitionConverter2().fromViewDefinition(totalsWithTimeBucket, DataCubeFixtures.wiki(), MANIFESTS);
      const convertedClause = essence.filter.clauses.first();

      const expectedClause = FilterClauseFixtures.timePeriod("time", "P1D", period);
      expect(convertedClause).to.deep.equal(expectedClause);
    });
  });
});
