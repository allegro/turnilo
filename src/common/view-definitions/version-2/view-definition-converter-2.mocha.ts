/*
 * Copyright 2017-2019 Allegro.pl
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
import { clientAppSettings } from "../../models/app-settings/app-settings.fixtures";
import { wikiClientDataCube } from "../../models/data-cube/data-cube.fixtures";
import { TimeFilterPeriod } from "../../models/filter-clause/filter-clause";
import { stringIn, timePeriod } from "../../models/filter-clause/filter-clause.fixtures";
import { ViewDefinitionConverter2 } from "./view-definition-converter-2";
import { ViewDefinitionConverter2Fixtures } from "./view-definition-converter-2.fixtures";

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

describe("ViewDefinitionConverter2", () => {

  [
    { label: "current day", expression: currentDay, period: TimeFilterPeriod.CURRENT },
    { label: "previous day", expression: previousDay, period: TimeFilterPeriod.PREVIOUS },
    { label: "latest day", expression: latestDay, period: TimeFilterPeriod.LATEST }
  ].forEach(({ label, expression, period }) => {
    it(`converts ${label} bucket expression to time period`, () => {
      const viewDefinition = ViewDefinitionConverter2Fixtures.tableWithFilterExpression(expression);
      const essence = new ViewDefinitionConverter2().fromViewDefinition(viewDefinition, clientAppSettings, wikiClientDataCube);
      const convertedClause = essence.filter.clauses.first();

      const expectedClause = timePeriod("time", "P1D", period);
      expect(convertedClause).to.deep.equal(expectedClause);
    });
  });

  it("converts filter with lookup expressions", () => {
    const viewDefinition = ViewDefinitionConverter2Fixtures.tableWithFilterActions([
      {
        action: "in",
        expression: {
          op: "chain",
          expression: {
            op: "ref",
            name: "n"
          },
          actions: [
            {
              action: "timeFloor",
              duration: "P1W"
            },
            {
              action: "timeRange",
              duration: "P1W",
              step: -1
            }
          ]
        }
      },
      {
        action: "and",
        expression: {
          op: "chain",
          expression: {
            op: "ref",
            name: "page"
          },
          actions: [
            {
              action: "lookup",
              lookup: "page_last_author"
            },
            {
              action: "overlap",
              expression: {
                op: "literal",
                value: {
                  setType: "STRING",
                  elements: [
                    "TypeScript"
                  ]
                },
                type: "SET"
              }
            }
          ]
        }
      }
    ]);
    const convertedFilter = new ViewDefinitionConverter2().fromViewDefinition(viewDefinition, clientAppSettings, wikiClientDataCube).filter;
    const convertedClause = convertedFilter.clauses.get(1);

    const expectedClause = stringIn("page_last_author", ["TypeScript"]);
    expect(convertedClause).to.deep.equal(expectedClause);
  });

  it("converts splits with lookup expressions", () => {
    const viewDefinition = ViewDefinitionConverter2Fixtures.tableWithSplits([{
      expression: {
        op: "chain",
        expression: {
          op: "ref",
          name: "page"
        },
        actions: [
          {
            action: "lookup",
            lookup: "page_last_author"
          }
        ]
      },
      sortAction: {
        action: "sort",
        expression: {
          op: "ref",
          name: "count"
        },
        direction: "descending"
      },
      limitAction: {
        action: "limit",
        limit: 10
      }
    }]);
    const convertedSplits = new ViewDefinitionConverter2().fromViewDefinition(viewDefinition, clientAppSettings, wikiClientDataCube).splits;

    expect(convertedSplits.getSplit(0).reference).to.equal("page_last_author");
  });

});
