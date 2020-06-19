import { ApplyExpression, Expression as PlywoodExpression } from "plywood";
import { ArithmeticExpression } from "./concreteArithmeticOperation";
import { PercentExpression } from "./percent";
export declare enum ExpressionSeriesOperation {
    PERCENT_OF_PARENT = "percent_of_parent",
    PERCENT_OF_TOTAL = "percent_of_total",
    SUBTRACT = "subtract",
    ADD = "add",
    MULTIPLY = "multiply",
    DIVIDE = "divide"
}
export declare type Expression = PercentExpression | ArithmeticExpression;
export interface ExpressionValue {
    operation: ExpressionSeriesOperation;
}
export interface ConcreteExpression {
    toExpression(expression: PlywoodExpression, name: string, nestingLevel: number): ApplyExpression;
    title(): string;
}
export declare function fromJS(params: any): Expression;
