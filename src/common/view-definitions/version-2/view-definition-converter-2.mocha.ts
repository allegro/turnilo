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
import { ViewDefinition2 } from "./view-definition-2";
import { ViewDefinitionConverter2 } from "./view-definition-converter-2";

describe("ViewDefinitionConverter2", () => {

  const totalsWithCurrentTimeBucket: ViewDefinition2 = {
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
    multiMeasureMode: true,
    selectedMeasures: ["count"],
    pinnedDimensions: [],
    pinnedSort: "delta"
  };

  it("converts current time bucket expression to time period", () => {
    const essence = new ViewDefinitionConverter2().fromViewDefinition(totalsWithCurrentTimeBucket, DataCubeFixtures.wiki(), MANIFESTS);
    const convertedClause = essence.filter.clauses.first();

    const expectedClause = FilterClauseFixtures.timePeriod("time", "P1D", TimeFilterPeriod.CURRENT);
    expect(convertedClause).to.deep.equal(expectedClause);
  });

  const totalsWithLatestTimeRange: ViewDefinition2 = {
    visualization: "totals",
    timezone: "Etc/UTC",
    filter: {
      op: "overlap",
      operand: {
        op: "ref",
        name: "time"
      },
      expression: {
        op: "timeRange",
        operand: {
          op: "ref",
          name: "m"
        },
        duration: "P1D",
        step: -3
      }
    },
    splits: [],
    singleMeasure: "delta",
    multiMeasureMode: true,
    selectedMeasures: ["count"],
    pinnedDimensions: [],
    pinnedSort: "delta"
  };

  it("converts latest time range expression to time period", () => {
    const essence = new ViewDefinitionConverter2().fromViewDefinition(totalsWithLatestTimeRange, DataCubeFixtures.wiki(), MANIFESTS);
    const convertedClause = essence.filter.clauses.first();

    const expectedClause = FilterClauseFixtures.timePeriod("time", "P3D", TimeFilterPeriod.LATEST);
    expect(convertedClause).to.deep.equal(expectedClause);
  });

  const totalsWithPreviousTimeRange: ViewDefinition2 = {
    visualization: "totals",
    timezone: "Etc/UTC",
    filter: {
      op: "overlap",
      operand: {
        op: "ref",
        name: "time"
      },
      expression: {
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
      }
    },
    splits: [],
    singleMeasure: "delta",
    multiMeasureMode: true,
    selectedMeasures: ["count"],
    pinnedDimensions: [],
    pinnedSort: "delta"
  };

  it("converts previous time bucket expression to time period", () => {
    const essence = new ViewDefinitionConverter2().fromViewDefinition(totalsWithPreviousTimeRange, DataCubeFixtures.wiki(), MANIFESTS);
    const convertedClause = essence.filter.clauses.first();

    const expectedClause = FilterClauseFixtures.timePeriod("time", "P1W", TimeFilterPeriod.PREVIOUS);
    expect(convertedClause).to.deep.equal(expectedClause);
  });

  const totalsWithSplits: ViewDefinition2 = {
    visualization: "table",
    timezone: "Etc/UTC",
    filter: {
      op: "chain",
      expression: {
        op: "ref",
        name: "time"
      },
      actions: [
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
      ]
    },
    splits: [
      {
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
      },
      {
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
      }
    ],
    multiMeasureMode: true,
    singleMeasure: "count",
    selectedMeasures: [
      "count"
    ],
    pinnedDimensions: [],
    pinnedSort: "count",
    colors: null,
    compare: null,
    highlight: null
  };

  it("converts filter with lookup expressions", () => {
    const convertedFilter = new ViewDefinitionConverter2().fromViewDefinition(totalsWithSplits, DataCubeFixtures.wiki(), MANIFESTS).filter;
    const convertedClause = convertedFilter.clauses.get(1);

    const expectedClause = FilterClauseFixtures.stringIn("page_last_author", ["TypeScript"]);
    expect(convertedClause).to.deep.equal(expectedClause);
  });

  it("converts splits with lookup expressions", () => {
    const convertedSplits = new ViewDefinitionConverter2().fromViewDefinition(totalsWithSplits, DataCubeFixtures.wiki(), MANIFESTS).splits;
    expect(convertedSplits.getSplit(0).reference).to.equal("page_last_author");
  });

  it("converts splits with plywood < 0.14.1 limits", () => {
    const convertedSplits = new ViewDefinitionConverter2().fromViewDefinition(totalsWithSplits, DataCubeFixtures.wiki(), MANIFESTS).splits;
    expect(convertedSplits.getSplit(0).limit).to.equal(10);
  });

  it("converts time bucket splits", () => {
    const convertedSplits = new ViewDefinitionConverter2().fromViewDefinition(totalsWithSplits, DataCubeFixtures.wiki(), MANIFESTS).splits;
    expect(convertedSplits.getSplit(1).bucket).to.deep.equal(Duration.fromJS("PT1H"));
  });

});
