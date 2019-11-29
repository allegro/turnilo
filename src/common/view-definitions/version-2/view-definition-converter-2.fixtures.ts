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

import { ViewDefinition2 } from "./view-definition-2";

const baseViewDefinition: ViewDefinition2 = {
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
  static withFilterExpression(expression: any): ViewDefinition2 {
    return {
      ...baseViewDefinition,
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

  static withFilterActions(actions: any[]): ViewDefinition2 {
    return {
      ...baseViewDefinition,
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

  static withSplits(splits: any[]): ViewDefinition2 {
    return {
      ...baseViewDefinition,
      splits
    };
  }
}
