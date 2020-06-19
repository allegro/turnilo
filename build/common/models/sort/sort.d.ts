import { Record } from "immutable";
import { Direction, SortExpression } from "plywood";
import { RequireOnly } from "../../utils/functional/functional";
import { SeriesDerivation } from "../series/concrete-series";
export declare enum SortType {
    SERIES = "series",
    DIMENSION = "dimension"
}
export declare enum SortDirection {
    ascending = "ascending",
    descending = "descending"
}
export declare const sortDirectionMapper: {
    [sort in SortDirection]: Direction;
};
interface BaseSortDefinition {
    reference: string;
    type: SortType;
    direction: SortDirection;
}
interface SortBehaviour {
    toExpression(): SortExpression;
}
export declare type Sort = SeriesSort | DimensionSort;
interface SeriesSortDefinition extends BaseSortDefinition {
    type: SortType.SERIES;
    period: SeriesDerivation;
}
declare const SeriesSort_base: Record.Factory<SeriesSortDefinition>;
export declare class SeriesSort extends SeriesSort_base implements SortBehaviour {
    constructor(params: RequireOnly<SeriesSortDefinition, "reference">);
    toExpression(): SortExpression;
}
interface DimensionSortDefinition extends BaseSortDefinition {
    type: SortType.DIMENSION;
}
declare const DimensionSort_base: Record.Factory<DimensionSortDefinition>;
export declare class DimensionSort extends DimensionSort_base implements SortBehaviour {
    constructor(params: RequireOnly<DimensionSortDefinition, "reference">);
    toExpression(): SortExpression;
}
export declare function isSortEmpty(sort: Sort): boolean;
export {};
