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
