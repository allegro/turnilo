import { Timezone } from "chronoshift";
import { List, OrderedSet, Record as ImmutableRecord } from "immutable";
import { RefExpression } from "plywood";
import { DataCube } from "../data-cube/data-cube";
import { Dimension } from "../dimension/dimension";
import { FixedTimeFilterClause, TimeFilterClause } from "../filter-clause/filter-clause";
import { Filter } from "../filter/filter";
import { SeriesList } from "../series-list/series-list";
import { ConcreteSeries } from "../series/concrete-series";
import { Series } from "../series/series";
import { SortOn } from "../sort-on/sort-on";
import { Sort } from "../sort/sort";
import { Split } from "../split/split";
import { Splits } from "../splits/splits";
import { TimeShift } from "../time-shift/time-shift";
import { TimeShiftEnv } from "../time-shift/time-shift-env";
import { Timekeeper } from "../timekeeper/timekeeper";
import { Resolve, VisualizationManifest } from "../visualization-manifest/visualization-manifest";
import { VisualizationSettings } from "../visualization-settings/visualization-settings";
export interface VisualizationAndResolve {
    visualization: VisualizationManifest;
    resolve: Resolve;
}
export declare enum VisStrategy {
    FairGame = 0,
    UnfairGame = 1,
    KeepAlways = 2
}
declare type DimensionId = string;
export interface EssenceValue {
    dataCube: DataCube;
    visualization: VisualizationManifest;
    visualizationSettings: VisualizationSettings | null;
    timezone: Timezone;
    filter: Filter;
    timeShift: TimeShift;
    splits: Splits;
    series: SeriesList;
    pinnedDimensions: OrderedSet<DimensionId>;
    pinnedSort: string;
    visResolve?: Resolve;
}
export interface EffectiveFilterOptions {
    unfilterDimension?: Dimension;
    combineWithPrevious?: boolean;
}
declare const Essence_base: ImmutableRecord.Factory<EssenceValue>;
export declare class Essence extends Essence_base {
    static getBestVisualization(dataCube: DataCube, splits: Splits, series: SeriesList, currentVisualization: VisualizationManifest): VisualizationAndResolve;
    static fromDataCube(dataCube: DataCube): Essence;
    static defaultSortReference(series: SeriesList, dataCube: DataCube): string;
    static defaultSort(series: SeriesList, dataCube: DataCube): Sort;
    static timeFilter(filter: Filter, dataCube: DataCube): TimeFilterClause;
    visResolve: Resolve;
    constructor(parameters: EssenceValue);
    toString(): string;
    toJS(): {
        visualization: VisualizationManifest<{}>;
        visualizationSettings: import("../../utils/immutable-utils/immutable-utils").ImmutableRecord<object>;
        dataCube: import("../data-cube/data-cube").DataCubeJS;
        timezone: string;
        filter: {
            clauses: any;
        };
        splits: {
            splits: any;
        };
        series: {
            series: any;
        };
        timeShift: string;
        pinnedSort: string;
        pinnedDimensions: any[];
        visResolve: Resolve;
    };
    getTimeAttribute(): RefExpression;
    getTimeDimension(): Dimension;
    evaluateSelection(filter: TimeFilterClause, timekeeper: Timekeeper): FixedTimeFilterClause;
    private combineWithPrevious;
    getTimeShiftEnv(timekeeper: Timekeeper): TimeShiftEnv;
    private constrainTimeShift;
    getEffectiveFilter(timekeeper: Timekeeper, { combineWithPrevious, unfilterDimension }?: EffectiveFilterOptions): Filter;
    hasComparison(): boolean;
    private combinePeriods;
    timeFilter(): TimeFilterClause;
    private fixedTimeFilter;
    currentTimeFilter(timekeeper: Timekeeper): FixedTimeFilterClause;
    private shiftToPrevious;
    previousTimeFilter(timekeeper: Timekeeper): FixedTimeFilterClause;
    getTimeClause(): TimeFilterClause;
    private concreteSeriesFromSeries;
    findConcreteSeries(key: string): ConcreteSeries;
    getConcreteSeries(): List<ConcreteSeries>;
    differentDataCube(other: Essence): boolean;
    differentSplits(other: Essence): boolean;
    differentTimeShift(other: Essence): boolean;
    differentSeries(other: Essence): boolean;
    differentSettings(other: Essence): boolean;
    differentEffectiveFilter(other: Essence, myTimekeeper: Timekeeper, otherTimekeeper: Timekeeper, unfilterDimension?: Dimension): boolean;
    getCommonSort(): Sort;
    changeComparisonShift(timeShift: TimeShift): Essence;
    updateDataCube(newDataCube: DataCube): Essence;
    changeFilter(filter: Filter): Essence;
    changeTimezone(newTimezone: Timezone): Essence;
    convertToSpecificFilter(timekeeper: Timekeeper): Essence;
    private defaultSplitSort;
    private setSortOnSplits;
    changeSplits(splits: Splits, strategy: VisStrategy): Essence;
    changeSplit(splitCombine: Split, strategy: VisStrategy): Essence;
    addSplit(split: Split, strategy: VisStrategy): Essence;
    removeSplit(split: Split, strategy: VisStrategy): Essence;
    addSeries(series: Series): Essence;
    removeSeries(series: Series): Essence;
    changeSeriesList(series: SeriesList): Essence;
    defaultSort(): string;
    private updateSorts;
    updateSplitsWithFilter(): Essence;
    changeVisualization(visualization: VisualizationManifest, settings?: VisualizationSettings): Essence;
    resolveVisualizationAndUpdate(): this;
    pin({ name }: Dimension): Essence;
    unpin({ name }: Dimension): Essence;
    changePinnedSortSeries(series: Series): Essence;
    seriesSortOns(withTimeShift?: boolean): List<SortOn>;
    getPinnedSortSeries(): ConcreteSeries;
}
export {};
