import { ApplyExpression, Expression as PlywoodExpression } from "plywood";
import { Measure } from "../measure/measure";
import { Measures } from "../measure/measures";
import { ConcreteSeries, SeriesDerivation } from "./concrete-series";
import { ExpressionSeries } from "./expression-series";
export declare class ExpressionConcreteSeries extends ConcreteSeries<ExpressionSeries> {
    private expression;
    constructor(series: ExpressionSeries, measure: Measure, measures: Measures);
    reactKey(derivation?: SeriesDerivation): string;
    title(derivation?: SeriesDerivation): string;
    protected applyExpression(expression: PlywoodExpression, name: string, nestingLevel: number): ApplyExpression;
}
