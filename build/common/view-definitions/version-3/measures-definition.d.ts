import { Measures } from "../../models/measure/measures";
import { SeriesList } from "../../models/series-list/series-list";
export interface MeasuresDefinitionJS {
    isMulti: boolean;
    single: string;
    multi: string[];
}
export interface SeriesDefinitionConverter {
    toEssenceSeries(measuresDefs: MeasuresDefinitionJS, measures: Measures): SeriesList;
}
export declare const seriesDefinitionConverter: SeriesDefinitionConverter;
