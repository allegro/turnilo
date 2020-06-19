import { Record } from "immutable";
import { ApplyExpression, Expression } from "plywood";
import { Measures } from "../measure/measures";
import { ConcreteExpression, ExpressionSeriesOperation, ExpressionValue } from "./expression";
export declare type PercentOperation = ExpressionSeriesOperation.PERCENT_OF_PARENT | ExpressionSeriesOperation.PERCENT_OF_TOTAL;
interface ExpressionPercentOfValue extends ExpressionValue {
    operation: PercentOperation;
}
declare const PercentExpression_base: Record.Factory<ExpressionPercentOfValue>;
export declare class PercentExpression extends PercentExpression_base {
    constructor(params: ExpressionPercentOfValue);
    key(): string;
    toConcreteExpression(_measures: Measures): ConcretePercentExpression;
}
export declare class ConcretePercentExpression implements ConcreteExpression {
    private operation;
    constructor(operation: PercentOperation);
    private relativeNesting;
    toExpression(expression: Expression, name: string, nestingLevel: number): ApplyExpression;
    title(): string;
}
export {};
