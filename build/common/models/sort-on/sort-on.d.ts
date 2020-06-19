import { Dimension } from "../dimension/dimension";
import { Essence } from "../essence/essence";
import { ConcreteSeries, SeriesDerivation } from "../series/concrete-series";
import { Sort, SortDirection } from "../sort/sort";
export declare abstract class SortOn {
    key: string;
    protected title: string;
    protected period?: SeriesDerivation;
    static fromSort(sort: Sort, essence: Essence): SortOn;
    static getKey(sortOn: SortOn): string;
    static getTitle(sortOn: SortOn): string;
    static equals(sortOn: SortOn, other: SortOn): boolean;
    protected constructor(key: string, title: string, period?: SeriesDerivation);
    abstract equals(other: SortOn): boolean;
    abstract toSort(direction: SortDirection): Sort;
}
export declare class DimensionSortOn extends SortOn {
    constructor(dimension: Dimension);
    equals(other: SortOn): boolean;
    toSort(direction: SortDirection): Sort;
}
export declare class SeriesSortOn extends SortOn {
    constructor(series: ConcreteSeries, period?: SeriesDerivation);
    equals(other: SortOn): boolean;
    toSort(direction: SortDirection): Sort;
}
