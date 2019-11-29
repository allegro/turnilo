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

import { Record } from "immutable";
import { ApplyExpression, Expression } from "plywood";
import { Measure } from "../measure/measure";
import { Measures } from "../measure/measures";
import { ConcreteExpression, ExpressionSeriesOperation, ExpressionValue } from "./expression";

export type ArithmeticOperation = ExpressionSeriesOperation.ADD
  | ExpressionSeriesOperation.SUBTRACT
  | ExpressionSeriesOperation.MULTIPLY
  | ExpressionSeriesOperation.DIVIDE;

interface ExpressionArithmeticOperationValue extends ExpressionValue {
  operation: ArithmeticOperation;
  reference: string;
}

const defaultExpression: ExpressionArithmeticOperationValue = {
  operation: null,
  reference: null
};

export class ArithmeticExpression extends Record<ExpressionArithmeticOperationValue>(defaultExpression) {

  constructor(params: ExpressionArithmeticOperationValue) {
    super(params);
  }

  key(): string {
    return `${this.operation}__${this.reference}`;
  }

  toConcreteExpression(measures: Measures): ConcreteArithmeticOperation {
    return new ConcreteArithmeticOperation(this.operation, measures.getMeasureByName(this.reference));
  }
}

export class ConcreteArithmeticOperation implements ConcreteExpression {

  constructor(private operation: ArithmeticOperation, private measure: Measure) {
  }

  private operationName(): string {
    switch (this.operation) {
      case ExpressionSeriesOperation.SUBTRACT:
        return "minus";
      case ExpressionSeriesOperation.MULTIPLY:
        return "times";
      case ExpressionSeriesOperation.DIVIDE:
        return "by";
      case ExpressionSeriesOperation.ADD:
        return "plus";
    }
  }

  title(): string {
    return ` ${this.operationName()} ${this.measure.title}`;
  }

  private calculate(a: Expression): Expression {
    const operand = this.measure.expression;
    switch (this.operation) {
      case ExpressionSeriesOperation.SUBTRACT:
        return a.subtract(operand);
      case ExpressionSeriesOperation.MULTIPLY:
        return a.multiply(operand);
      case ExpressionSeriesOperation.DIVIDE:
        return a.divide(operand);
      case ExpressionSeriesOperation.ADD:
        return a.add(operand);
    }
  }

  toExpression(expression: Expression, name: string, _nestingLevel: number): ApplyExpression {
    return new ApplyExpression({
      name,
      expression: this.calculate(expression)
    });
  }
}
