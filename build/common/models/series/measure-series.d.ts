import { Record } from "immutable";
import { RequireOnly } from "../../utils/functional/functional";
import { Measure } from "../measure/measure";
import { SeriesDerivation } from "./concrete-series";
import { BasicSeriesValue, SeriesBehaviours } from "./series";
import { SeriesFormat } from "./series-format";
import { SeriesType } from "./series-type";
interface MeasureSeriesValue extends BasicSeriesValue {
    type: SeriesType.MEASURE;
    reference: string;
    format: SeriesFormat;
}
declare const MeasureSeries_base: Record.Factory<MeasureSeriesValue>;
export declare class MeasureSeries extends MeasureSeries_base implements SeriesBehaviours {
    static fromMeasure(measure: Measure): MeasureSeries;
    static fromJS({ reference, format, type }: any): MeasureSeries;
    constructor(params: RequireOnly<MeasureSeriesValue, "reference">);
    key(): string;
    plywoodKey(derivation?: SeriesDerivation): string;
}
export {};
