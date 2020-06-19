import { Measure } from "../measure/measure";
import { SeriesDerivation } from "./concrete-series";
import { ExpressionSeries } from "./expression-series";
import { MeasureSeries } from "./measure-series";
import { QuantileSeries } from "./quantile-series";
import { SeriesType } from "./series-type";
export interface BasicSeriesValue {
    type: SeriesType;
}
export interface SeriesBehaviours {
    key: () => string;
    plywoodKey: (period?: SeriesDerivation) => string;
}
export declare type Series = MeasureSeries | ExpressionSeries | QuantileSeries;
export declare function fromMeasure(measure: Measure): MeasureSeries | QuantileSeries;
export declare function fromJS(params: any, measure: Measure): Series;
