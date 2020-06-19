import { Measures } from "../../models/measure/measures";
import { SeriesList } from "../../models/series-list/series-list";
import { SeriesFormat } from "../../models/series/series-format";
import { SeriesType } from "../../models/series/series-type";
interface BaseSeriesDefinition {
    reference: string;
    type?: SeriesType;
    format?: SeriesFormat;
}
interface MeasureSeriesDefinition extends BaseSeriesDefinition {
    type: SeriesType.MEASURE;
}
interface QuantileSeriesDefinition extends BaseSeriesDefinition {
    type: SeriesType.QUANTILE;
    percentile: number;
}
interface ExpressionSeriesDefinition extends BaseSeriesDefinition {
    type: SeriesType.EXPRESSION;
}
export declare type SeriesDefinition = BaseSeriesDefinition | MeasureSeriesDefinition | QuantileSeriesDefinition | ExpressionSeriesDefinition;
declare type SeriesDefinitionsList = SeriesDefinition[];
export interface SeriesDefinitionConverter {
    fromEssenceSeries(series: SeriesList): SeriesDefinitionsList;
    toEssenceSeries(seriesDefs: SeriesDefinitionsList, measures: Measures): SeriesList;
}
export declare const seriesDefinitionConverter: SeriesDefinitionConverter;
export {};
