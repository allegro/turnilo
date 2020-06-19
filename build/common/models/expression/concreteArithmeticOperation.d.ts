import { Record } from "immutable";
import { ApplyExpression, Expression } from "plywood";
import { Measure } from "../measure/measure";
import { Measures } from "../measure/measures";
import { ConcreteExpression, ExpressionSeriesOperation, ExpressionValue } from "./expression";
export declare type ArithmeticOperation = ExpressionSeriesOperation.ADD | ExpressionSeriesOperation.SUBTRACT | ExpressionSeriesOperation.MULTIPLY | ExpressionSeriesOperation.DIVIDE;
interface ExpressionArithmeticOperationValue extends ExpressionValue {
    operation: ArithmeticOperation;
    reference: string;
}
declare const ArithmeticExpression_base: Record.Factory<ExpressionArithmeticOperationValue>;
export declare class ArithmeticExpression extends ArithmeticExpression_base {
    constructor(params: ExpressionArithmeticOperationValue);
    key(): string;
    toConcreteExpression(measures: Measures): ConcreteArithmeticOperation;
}
export declare class ConcreteArithmeticOperation implements ConcreteExpression {
    private operation;
    private measure;
    constructor(operation: ArithmeticOperation, measure: Measure);
    private operationName;
    title(): string;
    private calculate;
    toExpression(expression: Expression, name: string, _nestingLevel: number): ApplyExpression;
}
export {};
