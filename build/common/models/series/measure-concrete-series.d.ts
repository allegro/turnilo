import { ApplyExpression, Expression } from "plywood";
import { Measure } from "../measure/measure";
import { ConcreteSeries } from "./concrete-series";
import { MeasureSeries } from "./measure-series";
export declare function fromMeasure(measure: Measure): MeasureConcreteSeries;
export declare class MeasureConcreteSeries extends ConcreteSeries<MeasureSeries> {
    protected applyExpression(expression: Expression, name: string, nestingLevel: number): ApplyExpression;
}
