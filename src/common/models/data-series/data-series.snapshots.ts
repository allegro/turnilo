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
import { DataSeriesPercentOf } from "./data-series";

export class DataSeriesExpressionSnapshots {
  static itemsExpWithNoFormula(): ExpressionJS {
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

  static itemsExpWithFormulaAtRootLevel(percentOf: DataSeriesPercentOf): ExpressionJS {
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
      name: `__formula_items_measure__${percentOf}_`,
      op: "apply"
    };
  }

  static itemsExpWithFormulaAtLevel(level: number, percentOf: DataSeriesPercentOf): ExpressionJS {
    return {
      expression: {
        expression: {
          name: `__formula_items_measure__${percentOf}_`,
          nest: level,
          op: "ref"
        },
        op: "divide",
        operand: {
          name: `__formula_items_measure__${percentOf}_`,
          op: "ref"
        }
      },
      name: `items_measure__${percentOf}_`,
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
        name: `__formula_items_measure__${percentOf}_`,
        op: "apply"
      }
    };
  }

  static itemInCurrentPeriod(start: Date, end: Date) {
    return {
      expression: {
        expression: {
          name: "item",
          op: "ref"
        },
        op: "sum",
        operand: {
          expression: {
            expression: {
              op: "literal",
              type: "SET",
              value: {
                elements: [{ end, start }],
                setType: "TIME_RANGE"
              }
            },
            op: "overlap",
            operand: {
              name: "time",
              op: "ref"
            }
          },
          op: "filter",
          operand: {
            name: "main",
            op: "ref"
          }
        }
      },
      name: "items_measure",
      op: "apply"
    };
  }

  static itemInPreviousPeriod(start: Date, end: Date) {
    return {
      expression: {
        expression: {
          name: "item",
          op: "ref"
        },
        op: "sum",
        operand: {
          expression: {
            expression: {
              op: "literal",
              type: "SET",
              value: {
                elements: [{ end, start }],
                setType: "TIME_RANGE"
              }
            },
            op: "overlap",
            operand: {
              name: "time",
              op: "ref"
            }
          },
          op: "filter",
          operand: {
            name: "main",
            op: "ref"
          }
        }
      },
      name: "_previous__items_measure",
      op: "apply"
    };
  }
}
