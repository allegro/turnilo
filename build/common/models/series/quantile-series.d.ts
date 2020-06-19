import { Record } from "immutable";
import { RequireOnly } from "../../utils/functional/functional";
import { Measure } from "../measure/measure";
import { SeriesDerivation } from "./concrete-series";
import { SeriesBehaviours } from "./series";
import { SeriesFormat } from "./series-format";
import { SeriesType } from "./series-type";
interface QuantileSeriesValue {
    type: SeriesType.QUANTILE;
    reference: string;
    format: SeriesFormat;
    percentile: number;
}
declare const QuantileSeries_base: Record.Factory<QuantileSeriesValue>;
export declare class QuantileSeries extends QuantileSeries_base implements SeriesBehaviours {
    static fromJS({ type, reference, percentile, format }: any): QuantileSeries;
    static fromQuantileMeasure({ name: reference, expression }: Measure): QuantileSeries;
    constructor(params: RequireOnly<QuantileSeriesValue, "percentile" | "reference">);
    formattedPercentile(): string;
    key(): string;
    plywoodKey(derivation?: SeriesDerivation): string;
}
export {};
