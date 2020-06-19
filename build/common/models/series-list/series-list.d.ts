import { List, Record } from "immutable";
import { Measure } from "../measure/measure";
import { Measures } from "../measure/measures";
import { ExpressionSeries } from "../series/expression-series";
import { Series } from "../series/series";
interface SeriesListValue {
    series: List<Series>;
}
declare const SeriesList_base: Record.Factory<SeriesListValue>;
export declare class SeriesList extends SeriesList_base {
    static fromMeasureNames(names: string[]): SeriesList;
    static fromMeasures(measures: Measure[]): SeriesList;
    static fromJS(seriesDefs: any[], measures: Measures): SeriesList;
    static fromSeries(series: Series[]): SeriesList;
    static validSeries(series: Series, measures: Measures): boolean;
    addSeries(newSeries: Series): SeriesList;
    removeSeries(series: Series): SeriesList;
    replaceSeries(original: Series, newSeries: Series): SeriesList;
    replaceByIndex(index: number, replace: Series): SeriesList;
    insertByIndex(index: number, insert: Series): SeriesList;
    hasMeasureSeries(reference: string): boolean;
    hasMeasure({ name }: Measure): boolean;
    getSeries(reference: string): Series;
    constrainToMeasures(measures: Measures): SeriesList;
    count(): number;
    isEmpty(): boolean;
    private updateSeries;
    hasSeries(series: Series): boolean;
    hasSeriesWithKey(key: string): boolean;
    getSeriesWithKey(key: string): Series;
    takeFirst(): this;
    getExpressionSeriesFor(reference: string): List<ExpressionSeries>;
}
export declare const EMPTY_SERIES: SeriesList;
export {};
