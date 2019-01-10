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
