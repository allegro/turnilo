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

import { ApplyExpression, Expression as PlywoodExpression } from "plywood";
import { Measures } from "../measure/measures";
import { ExpressionArithmeticOperation } from "./arithemtic-operation";
import { ConcretePercentOf, ExpressionPercentOf } from "./percent-of";

export enum ExpressionSeriesOperation {
  PERCENT_OF_PARENT = "percent_of_parent",
  PERCENT_OF_TOTAL = "percent_of_total",
  SUBTRACT = "subtract",
  ADD = "add",
  MULTIPLY = "multiply",
  DIVIDE = "divide"
}

export type Expression = ExpressionPercentOf | ExpressionArithmeticOperation;

export interface ExpressionValue {
  operation: ExpressionSeriesOperation;
}

export interface ConcreteExpression {
  plywoodKey(): string;

  toExpression(expression: PlywoodExpression, name: string, nestingLevel: number): ApplyExpression;
}

export function fromExpression(expression: Expression, measures: Measures): ConcreteExpression {
  if (expression instanceof ExpressionPercentOf) return new ConcretePercentOf(expression.operation);
  return null;
}

export function fromJS(params: any): Expression {
  const { operation } = params;
  switch (operation as ExpressionSeriesOperation) {
    case ExpressionSeriesOperation.PERCENT_OF_TOTAL:
    case ExpressionSeriesOperation.PERCENT_OF_PARENT:
      return new ExpressionPercentOf({ operation });
    case ExpressionSeriesOperation.SUBTRACT:
    case ExpressionSeriesOperation.ADD:
    case ExpressionSeriesOperation.MULTIPLY:
    case ExpressionSeriesOperation.DIVIDE:
      const reference = params.reference;
      return new ExpressionArithmeticOperation({ operation, reference });
  }
}
