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

import { ExpressionJS } from "plywood";
import { Measure } from "./measure";

export class MeasureFixtures {
  static noTransformationMeasure(): Measure {
    return Measure.fromJS({
      name: "items_measure",
      formula: "$main.sum($item)"
    });
  }

  static percentOfParentMeasure(): Measure {
    return Measure.fromJS({
      name: "items_measure",
      formula: "$main.sum($item)",
      transformation: "percent-of-parent"
    });
  }

  static percentOfTotalMeasure(): Measure {
    return Measure.fromJS({
      name: "items_measure",
      formula: "$main.sum($item)",
      transformation: "percent-of-total"
    });
  }

  static applyWithNoTransformation(): ExpressionJS {
    return {
      expression: {
        expression: {
          name: "item",
          op: "ref"
        },
        op: "sum",
        operand: {
          name: "main",
          op: "ref"
        }
      },
      name: "items_measure",
      op: "apply"
    };
  }

  static applyWithTransformationAtRootLevel(): ExpressionJS {
    return {
      expression: {
        expression: {
          name: "item",
          op: "ref"
        },
        op: "sum",
        operand: {
          name: "main",
          op: "ref"
        }
      },
      name: "__formula_items_measure",
      op: "apply"
    };
  }

  static applyWithTransformationAtLevel(level: number): ExpressionJS {
    return {
      expression: {
        expression: {
          op: "literal",
          value: 100
        },
        op: "multiply",
        operand: {
          expression: {
            name: "__formula_items_measure",
            nest: level,
            op: "ref"
          },
          op: "divide",
          operand: {
            name: "__formula_items_measure",
            op: "ref"
          }
        }
      },
      name: "items_measure",
      op: "apply",
      operand: {
        expression: {
          expression: {
            name: "item",
            op: "ref"
          },
          op: "sum",
          operand: {
            name: "main",
            op: "ref"
          }
        },
        name: "__formula_items_measure",
        op: "apply"
      }
    };
  }
}
