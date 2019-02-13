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
import { Duration } from "chronoshift";
import { MANIFESTS } from "../../manifests";
import { DataCubeFixtures } from "../../models/data-cube/data-cube.fixtures";
import { TimeFilterPeriod } from "../../models/filter-clause/filter-clause";
import { FilterClauseFixtures } from "../../models/filter-clause/filter-clause.fixtures";
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

it("converts current time bucket expression to time period", () => {
    const viewDefinition = ViewDefinitionConverter2Fixtures.withFilterExpression({
      op: "timeBucket",
      operand: {
        op: "ref",
        name: "n"
      },
      duration: "P1D"
    });
    const essence = new ViewDefinitionConverter2().fromViewDefinition(viewDefinition, DataCubeFixtures.wiki(), MANIFESTS);
    const convertedClause = essence.filter.clauses.first();

    const expectedClause = FilterClauseFixtures.timePeriod("time", "P1D", TimeFilterPeriod.CURRENT);
    expect(convertedClause).to.deep.equal(expectedClause);
  });

it("converts latest time range expression to time period", () => {
    const viewDefinition = ViewDefinitionConverter2Fixtures.withFilterExpression({
      op: "timeRange",
      operand: {
        op: "ref",
        name: "m"
      },
      duration: "P1D",
      step: -3
    });
    const essence = new ViewDefinitionConverter2().fromViewDefinition(viewDefinition, DataCubeFixtures.wiki(), MANIFESTS);
    const convertedClause = essence.filter.clauses.first();

    const expectedClause = FilterClauseFixtures.timePeriod("time", "P3D", TimeFilterPeriod.LATEST);
    expect(convertedClause).to.deep.equal(expectedClause);
  });

it("converts previous time bucket expression to time period", () => {
    const viewDefintiion = ViewDefinitionConverter2Fixtures.withFilterExpression({
      op: "timeRange",
      operand: {
        op: "timeFloor",
        operand: {
          op: "ref",
          name: "n"
        },
        duration: "P1W"
      },
      duration: "P1W",
      step: -1
    });
    const essence = new ViewDefinitionConverter2().fromViewDefinition(viewDefintiion, DataCubeFixtures.wiki(), MANIFESTS);
    const convertedClause = essence.filter.clauses.first();

    const expectedClause = FilterClauseFixtures.timePeriod("time", "P1W", TimeFilterPeriod.PREVIOUS);
    expect(convertedClause).to.deep.equal(expectedClause);
    });

it("converts filter with lookup expressions", () => {
      const viewDefinition = ViewDefinitionConverter2Fixtures.withFilterActions([
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
      const convertedFilter = new ViewDefinitionConverter2().fromViewDefinition(viewDefinition, DataCubeFixtures.wiki(), MANIFESTS).filter;
      const convertedClause = convertedFilter.clauses.get(1);

      const expectedClause = FilterClauseFixtures.stringIn("page_last_author", ["TypeScript"]);
      expect(convertedClause).to.deep.equal(expectedClause);
    });

const splitWithLookupAndLimit = {
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
    };

it("converts splits with lookup expressions", () => {
      const viewDefinition = ViewDefinitionConverter2Fixtures.withSplits([splitWithLookupAndLimit]);
      const convertedSplits = new ViewDefinitionConverter2().fromViewDefinition(viewDefinition, DataCubeFixtures.wiki(), MANIFESTS).splits;

      expect(convertedSplits.getSplit(0).reference).to.equal("page_last_author");
    });

it("converts splits with plywood < 0.14.1 limits", () => {
      const viewDefinition = ViewDefinitionConverter2Fixtures.withSplits([splitWithLookupAndLimit]);
      const convertedSplits = new ViewDefinitionConverter2().fromViewDefinition(viewDefinition, DataCubeFixtures.wiki(), MANIFESTS).splits;

      expect(convertedSplits.getSplit(0).limit).to.equal(10);
    });

it("converts time bucket splits", () => {
      const viewDefinition = ViewDefinitionConverter2Fixtures.withSplits([{
        expression: {
          op: "ref",
          name: "time"
        },
        bucketAction: {
          action: "timeBucket",
          duration: "PT1H"
        },
        sortAction: {
          action: "sort",
          expression: {
            op: "ref",
            name: "time"
          },
          direction: "ascending"
        }
      }]);
      const convertedSplits = new ViewDefinitionConverter2().fromViewDefinition(viewDefinition, DataCubeFixtures.wiki(), MANIFESTS).splits;

      expect(convertedSplits.getSplit(0).bucket).to.deep.equal(Duration.fromJS("PT1H"));
    });
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
      const viewDefinition = ViewDefinitionConverter2Fixtures.withFilterExpression(expression);
      const essence = new ViewDefinitionConverter2().fromViewDefinition(viewDefinition, DataCubeFixtures.wiki(), MANIFESTS);
      const convertedClause = essence.filter.clauses.first();

      const expectedClause = FilterClauseFixtures.timePeriod("time", "P1D", period);
      expect(convertedClause).to.deep.equal(expectedClause);
    });
  });

  it("converts filter with lookup expressions", () => {
    const viewDefinition = ViewDefinitionConverter2Fixtures.withFilterActions([
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
    const convertedFilter = new ViewDefinitionConverter2().fromViewDefinition(viewDefinition, DataCubeFixtures.wiki(), MANIFESTS).filter;
    const convertedClause = convertedFilter.clauses.get(1);

    const expectedClause = FilterClauseFixtures.stringIn("page_last_author", ["TypeScript"]);
    expect(convertedClause).to.deep.equal(expectedClause);
  });

  it("converts splits with lookup expressions", () => {
    const viewDefinition = ViewDefinitionConverter2Fixtures.withSplits([{
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
    const convertedSplits = new ViewDefinitionConverter2().fromViewDefinition(viewDefinition, DataCubeFixtures.wiki(), MANIFESTS).splits;

    expect(convertedSplits.getSplit(0).reference).to.equal("page_last_author");
  });
});
