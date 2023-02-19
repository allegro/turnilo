/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { $ } from "plywood";
import { ViewDefinition2 } from "./view-definition-2";

const baseTableViewDefinition: ViewDefinition2 = {
  visualization: "table",
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

export class ViewDefinitionConverter2Fixtures {
  static totals(): ViewDefinition2 {
    return {
      visualization: "totals",
      timezone: "Etc/UTC",
      filter: $("time").overlap(new Date("2015-09-12Z"), new Date("2015-09-13Z")),
      pinnedDimensions: [],
      singleMeasure: "count",
      selectedMeasures: [],
      splits: []   ,
      multiMeasureMode: false
    };
  }

  static fullTable(): ViewDefinition2 {
    return {
      visualization: "table",
      timezone: "Etc/UTC",
      filter:
        $("time")
          .overlap(new Date("2015-09-12Z"), new Date("2015-09-13Z"))
          .and($("channel").overlap(["en"]))
          .and($("isRobot").overlap([true]).not())
          .and($("page").contains("Jeremy"))
          .and($("userChars").match("^A$"))
          .and($("commentLength").overlap([{ start: 3, end: null, type: "NUMBER_RANGE" }]))
          .toJS(),
      pinnedDimensions: ["channel", "namespace", "isRobot"],
      pinnedSort: "delta",
      singleMeasure: "delta",
      selectedMeasures: ["delta", "count", "added"],
      multiMeasureMode: true,
      splits: [
        {
          expression: {
            op: "ref",
            name: "channel"
          },
          sortAction: {
            op: "sort",
            expression: {
              op: "ref",
              name: "delta"
            },
            direction: "descending"
          },
          limitAction: {
            op: "limit",
            value: 50
          }
        },
        {
          expression: {
            op: "ref",
            name: "isRobot"
          },
          sortAction: {
            op: "sort",
            expression: {
              op: "ref",
              name: "delta"
            },
            direction: "descending"
          },
          limitAction: {
            op: "limit",
            value: 5
          }
        },
        {
          expression: {
            op: "ref",
            name: "commentLength"
          },
          bucketAction: {
            op: "numberBucket",
            size: 10,
            offset: 0
          },
          sortAction: {
            op: "sort",
            expression: {
              op: "ref",
              name: "delta"
            },
            direction: "descending"
          },
          limitAction: {
            op: "limit",
            value: 5
          }
        },
        {
          expression: {
            op: "ref",
            name: "time"
          },
          bucketAction: {
            op: "timeBucket",
            duration: "PT1H"
          },
          sortAction: {
            op: "sort",
            expression: {
              op: "ref",
              name: "delta"
            },
            direction: "descending"
          }
        }

      ]
    };
  }

  static tableWithFilterExpression(expression: any): ViewDefinition2 {
    return {
      ...baseTableViewDefinition,
      filter: {
        op: "overlap",
        operand: {
          op: "ref",
          name: "time"
        },
        expression
      }
    };
  }

  static tableWithFilterActions(actions: any[]): ViewDefinition2 {
    return {
      ...baseTableViewDefinition,
      filter: {
        op: "chain",
        expression: {
          op: "ref",
          name: "time"
        },
        actions
      }
    };
  }

  static tableWithSplits(splits: any[]): ViewDefinition2 {
    return {
      ...baseTableViewDefinition,
      splits
    };
  }
}
