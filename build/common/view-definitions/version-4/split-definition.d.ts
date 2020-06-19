import { SeriesDerivation } from "../../models/series/concrete-series";
import { SortDirection, SortType } from "../../models/sort/sort";
import { Split, SplitType } from "../../models/split/split";
export interface SplitSortDefinition {
    ref: string;
    direction: SortDirection;
    type: SortType;
    period?: SeriesDerivation;
}
export interface BaseSplitDefinition {
    type: SplitType;
    dimension: string;
    sort: SplitSortDefinition;
    limit?: number;
}
export interface NumberSplitDefinition extends BaseSplitDefinition {
    type: SplitType.number;
    granularity: number;
}
export interface StringSplitDefinition extends BaseSplitDefinition {
    type: SplitType.string;
}
export interface TimeSplitDefinition extends BaseSplitDefinition {
    type: SplitType.time;
    granularity: string;
}
export declare type SplitDefinition = NumberSplitDefinition | StringSplitDefinition | TimeSplitDefinition;
export interface SplitDefinitionConverter {
    toSplitCombine(split: SplitDefinition): Split;
    fromSplitCombine(splitCombine: Split): SplitDefinition;
}
export declare const splitConverter: SplitDefinitionConverter;
