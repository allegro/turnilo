import { ApplyExpression, Expression as PlywoodExpression } from "plywood";
import { Measure } from "../measure/measure";
import { ConcreteSeries, SeriesDerivation } from "./concrete-series";
import { QuantileSeries } from "./quantile-series";
export declare class QuantileConcreteSeries extends ConcreteSeries<QuantileSeries> {
    constructor(series: QuantileSeries, measure: Measure);
    title(derivation?: SeriesDerivation): string;
    protected applyExpression(quantileExpression: PlywoodExpression, name: string, nestingLevel: number): ApplyExpression;
}
