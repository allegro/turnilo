import { Record } from "immutable";
import { RequireOnly } from "../../utils/functional/functional";
import { Expression } from "../expression/expression";
import { SeriesDerivation } from "./concrete-series";
import { BasicSeriesValue, SeriesBehaviours } from "./series";
import { SeriesFormat } from "./series-format";
import { SeriesType } from "./series-type";
interface ExpressionSeriesValue extends BasicSeriesValue {
    type: SeriesType.EXPRESSION;
    reference: string;
    expression: Expression;
    format: SeriesFormat;
}
declare const ExpressionSeries_base: Record.Factory<ExpressionSeriesValue>;
export declare class ExpressionSeries extends ExpressionSeries_base implements SeriesBehaviours {
    static fromJS({ type, reference, expression, format }: any): ExpressionSeries;
    constructor(params: RequireOnly<ExpressionSeriesValue, "reference" | "expression">);
    key(): string;
    plywoodKey(period?: SeriesDerivation): string;
}
export {};
