import { List, Record, Set } from "immutable";
import { Dimension } from "../dimension/dimension";
import { Dimensions } from "../dimension/dimensions";
import { Filter } from "../filter/filter";
import { SeriesList } from "../series-list/series-list";
import { Sort } from "../sort/sort";
import { Split } from "../split/split";
export interface SplitsValue {
    splits: List<Split>;
}
declare const Splits_base: Record.Factory<SplitsValue>;
export declare class Splits extends Splits_base {
    static fromSplit(split: Split): Splits;
    static fromSplits(splits: Split[]): Splits;
    static fromDimensions(dimensions: List<Dimension>): Splits;
    toString(): string;
    replaceByIndex(index: number, replace: Split): Splits;
    insertByIndex(index: number, insert: Split): Splits;
    addSplit(split: Split): Splits;
    removeSplit(split: Split): Splits;
    changeSort(sort: Sort): Splits;
    setSortToDimension(): Splits;
    length(): number;
    getSplit(index: number): Split;
    findSplitForDimension({ name }: Dimension): Split;
    hasSplitOn(dimension: Dimension): boolean;
    replace(search: Split, replace: Split): Splits;
    removeBucketingFrom(references: Set<string>): this;
    updateWithFilter(filter: Filter, dimensions: Dimensions): Splits;
    constrainToDimensionsAndSeries(dimensions: Dimensions, series: SeriesList): Splits;
    changeSortIfOnMeasure(fromMeasure: string, toMeasure: string): Splits;
    getCommonSort(): Sort;
    private updateSplits;
    slice(from: number, to?: number): this;
}
export declare const EMPTY_SPLITS: Splits;
export {};
