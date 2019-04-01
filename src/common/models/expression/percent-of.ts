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

import { Record } from "immutable";
import { $, ApplyExpression, Expression } from "plywood";
import { ConcreteExpression, ExpressionSeriesOperation, ExpressionValue } from "./expression";

export type PercentOperation = ExpressionSeriesOperation.PERCENT_OF_PARENT | ExpressionSeriesOperation.PERCENT_OF_TOTAL;

interface ExpressionPercentOfValue extends ExpressionValue {
  operation: PercentOperation;
}

const defaultPercentOf: ExpressionPercentOfValue = {
  operation: null
};

export class ExpressionPercentOf extends Record<ExpressionPercentOfValue>(defaultPercentOf) {

  constructor(params: ExpressionPercentOfValue) {
    super(params);
  }

  key(): string {
    return this.operation;
  }

  title(): string {
    switch (this.operation) {
      case ExpressionSeriesOperation.PERCENT_OF_PARENT:
        return "(% of Parent)";
      case ExpressionSeriesOperation.PERCENT_OF_TOTAL:
        return "(% of Total)";
    }
  }
}

export class ConcretePercentOf implements ConcreteExpression {

  constructor(private operation: PercentOperation) {
  }

  private relativeNesting(nestingLevel: number): number {
    switch (this.operation) {
      case ExpressionSeriesOperation.PERCENT_OF_TOTAL:
        return nestingLevel;
      case ExpressionSeriesOperation.PERCENT_OF_PARENT:
        return Math.min(nestingLevel, 1);
    }
  }

  public toExpression(expression: Expression, name: string, nestingLevel: number): ApplyExpression {
    const relativeNesting = this.relativeNesting(nestingLevel);
    const formulaName = `__formula_${name}`;
    if (relativeNesting > 0) {
      return new ApplyExpression({
        name,
        operand: new ApplyExpression({ expression, name: formulaName }),
        expression: $(formulaName).divide($(formulaName, relativeNesting))
      });
    }
    if (relativeNesting === 0) {
      return new ApplyExpression({ name: formulaName, expression });
    }
    throw new Error(`wrong nesting level: ${relativeNesting}`);
  }

  plywoodKey(): string {
    return "";
  }

}
