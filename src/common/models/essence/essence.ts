/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Timezone } from "chronoshift";
import { List, OrderedSet, Record as ImmutableRecord, Set } from "immutable";
import { serialize as serializeAppSettings } from "../../../client/deserializers/app-settings";
import { serialize as serializeDataCube } from "../../../client/deserializers/data-cube";
import { thread } from "../../utils/functional/functional";
import nullableEquals from "../../utils/immutable-utils/nullable-equals";
import { visualizationIndependentEvaluator } from "../../utils/rules/visualization-independent-evaluator";
import { formatUrlSafeDateTime } from "../../utils/time/time";
import { MANIFESTS } from "../../visualization-manifests";
import { ClientAppSettings } from "../app-settings/app-settings";
import {
  ClientDataCube,
  getDefaultFilter,
  getDefaultSeries,
  getDefaultSplits,
  getMaxTime,
  getTimeDimension
} from "../data-cube/data-cube";
import { DateRange } from "../date-range/date-range";
import { Dimension } from "../dimension/dimension";
import { findDimensionByName } from "../dimension/dimensions";
import {
  FilterClause,
  FixedTimeFilterClause,
  isTimeFilter,
  TimeFilterClause,
  toExpression
} from "../filter-clause/filter-clause";
import { Filter } from "../filter/filter";
import { findMeasureByName, hasMeasureWithName } from "../measure/measures";
import { SeriesList } from "../series-list/series-list";
import { ConcreteSeries, SeriesDerivation } from "../series/concrete-series";
import createConcreteSeries from "../series/create-concrete-series";
import { Series } from "../series/series";
import { SeriesSortOn, SortOn } from "../sort-on/sort-on";
import { DimensionSort, isSortEmpty, SeriesSort, Sort, SortDirection, SortType } from "../sort/sort";
import { Split } from "../split/split";
import { Splits } from "../splits/splits";
import { TimeShift } from "../time-shift/time-shift";
import { TimeShiftEnv, TimeShiftEnvType } from "../time-shift/time-shift-env";
import { Timekeeper } from "../timekeeper/timekeeper";
import { Resolve, VisualizationManifest } from "../visualization-manifest/visualization-manifest";
import { VisualizationSettings } from "../visualization-settings/visualization-settings";

function constrainDimensions(dimensions: OrderedSet<string>, dataCube: ClientDataCube): OrderedSet<string> {
  return dimensions.filter(dimensionName => Boolean(findDimensionByName(dataCube.dimensions, dimensionName))) as OrderedSet<string>;
}

export interface VisualizationAndResolve {
  visualization: VisualizationManifest;
  resolve: Resolve;
}

/**
 * FairGame   - Run all visualizations pretending that there is no current
 * UnfairGame - Run all visualizations but mark current vis as current
 * KeepAlways - Just keep the current one
 */
export enum VisStrategy {
  FairGame,
  UnfairGame,
  KeepAlways
}

type DimensionId = string;

export interface EssenceValue {
  appSettings: ClientAppSettings;
  dataCube: ClientDataCube;
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

const defaultEssence: EssenceValue = {
  appSettings: null,
  dataCube: null,
  visualization: null,
  visualizationSettings: null,
  timezone: Timezone.UTC,
  filter: null,
  splits: null,
  series: null,
  pinnedDimensions: OrderedSet([]),
  pinnedSort: null,
  timeShift: TimeShift.empty(),
  visResolve: null
};

export interface EffectiveFilterOptions {
  unfilterDimension?: Dimension;
  combineWithPrevious?: boolean;
}

type VisualizationResolverResult = Pick<EssenceValue, "splits" | "visualization" | "visResolve">;
type VisualizationResolverParameters = Pick<EssenceValue, "visualization" | "dataCube" | "splits" | "series" | "appSettings">;

function resolveVisualization({ visualization, dataCube, splits, series, appSettings }: VisualizationResolverParameters): VisualizationResolverResult {

  let visResolve: Resolve;
  // Place vis here because it needs to know about splits and colors (and maybe later other things)
  if (!visualization) {
    const visAndResolve = Essence.getBestVisualization(appSettings, dataCube, splits, series, null);
    visualization = visAndResolve.visualization;
  }

  const ruleVariables = { appSettings, dataCube, series, splits, isSelectedVisualization: true };
  visResolve = visualization.evaluateRules(ruleVariables);
  if (visResolve.isAutomatic()) {
    const adjustment = visResolve.adjustment;
    splits = adjustment.splits;
    visResolve = visualization.evaluateRules({ ...ruleVariables, splits });

    if (!visResolve.isReady()) {
      throw new Error(visualization.title + " must be ready after automatic adjustment");
    }
  }

  if (visResolve.isReady()) {
    visResolve = visualizationIndependentEvaluator({ dataCube, series });
  }
  return { visualization, splits, visResolve };
}

export class Essence extends ImmutableRecord<EssenceValue>(defaultEssence) {

  static getBestVisualization(
    appSettings: ClientAppSettings,
    dataCube: ClientDataCube,
    splits: Splits,
    series: SeriesList,
    currentVisualization: VisualizationManifest
  ): VisualizationAndResolve {
    const visAndResolves = MANIFESTS.map(visualization => {
      const isSelectedVisualization = visualization === currentVisualization;
      const ruleVariables = { appSettings, dataCube, splits, series, isSelectedVisualization };
      return {
        visualization,
        resolve: visualization.evaluateRules(ruleVariables)
      };
    });

    return visAndResolves.sort((vr1, vr2) => Resolve.compare(vr1.resolve, vr2.resolve))[0];
  }

  static fromDataCube(dataCube: ClientDataCube, appSettings: ClientAppSettings): Essence {
    const essence = new Essence({
      appSettings,
      dataCube,
      visualization: null,
      visualizationSettings: null,
      timezone: dataCube.defaultTimezone,
      filter: getDefaultFilter(dataCube),
      timeShift: TimeShift.empty(),
      splits: getDefaultSplits(dataCube),
      series: getDefaultSeries(dataCube),
      pinnedDimensions: OrderedSet(dataCube.defaultPinnedDimensions),
      pinnedSort: dataCube.defaultSortMeasure
    });

    return essence.updateSplitsWithFilter();
  }

  static defaultSortReference(series: SeriesList, dataCube: ClientDataCube): string {
    const seriesRefs = Set(series.series.map(series => series.key()));
    const defaultSort = dataCube.defaultSortMeasure;
    if (seriesRefs.has(defaultSort)) return defaultSort;
    return seriesRefs.first();
  }

  static timeFilter(filter: Filter, dataCube: ClientDataCube): TimeFilterClause {
    const timeFilter = filter.getClauseForDimension(getTimeDimension(dataCube));
    if (!isTimeFilter(timeFilter)) throw new Error(`Unknown time filter: ${timeFilter}`);
    return timeFilter;
  }

  constructor(parameters: EssenceValue) {
    const {
      filter,
      dataCube,
      timezone,
      timeShift,
      series,
      pinnedDimensions,
      pinnedSort
    } = parameters;

    if (!dataCube) throw new Error("Essence must have a dataCube");

    const { visResolve, visualization, splits } = resolveVisualization(parameters);

    const constrainedSeries = series && series.constrainToMeasures(dataCube.measures);

    const isPinnedSortValid = series && constrainedSeries.hasMeasureSeries(pinnedSort);
    const constrainedPinnedSort = isPinnedSortValid ? pinnedSort : Essence.defaultSortReference(constrainedSeries, dataCube);

    const constrainedFilter = filter.constrainToDimensions(dataCube.dimensions);

    const validTimezone = timezone || Timezone.UTC;

    const timeFilter = Essence.timeFilter(filter, dataCube);
    const constrainedTimeShift = timeShift.constrainToFilter(timeFilter, validTimezone);

    super({
      ...parameters,
      dataCube,
      visualization,
      timezone: validTimezone,
      timeShift: constrainedTimeShift,
      splits: splits && splits.constrainToDimensionsAndSeries(dataCube.dimensions, constrainedSeries),
      filter: constrainedFilter,
      series: constrainedSeries,
      pinnedDimensions: constrainDimensions(pinnedDimensions, dataCube),
      pinnedSort: constrainedPinnedSort,
      visResolve
    });
  }

  public toString(): string {
    return "[Essence]";
  }

  public toJS() {
    return {
      appSettings: serializeAppSettings(this.appSettings),
      visualization: this.visualization,
      visualizationSettings: this.visualizationSettings,
      dataCube: serializeDataCube(this.dataCube),
      timezone: this.timezone.toJS(),
      filter: this.filter && this.filter.toJS(),
      splits: this.splits && this.splits.toJS(),
      series: this.series.toJS(),
      timeShift: this.timeShift.toJS(),
      pinnedSort: this.pinnedSort,
      pinnedDimensions: this.pinnedDimensions.toJS(),
      visResolve: this.visResolve
    };
  }

  public getTimeDimension(): Dimension {
    return getTimeDimension(this.dataCube);
  }

  public evaluateSelection(filter: TimeFilterClause, timekeeper: Timekeeper): FixedTimeFilterClause {
    if (filter instanceof FixedTimeFilterClause) return filter;
    const { timezone, dataCube } = this;
    return filter.evaluate(timekeeper.now(), getMaxTime(dataCube, timekeeper), timezone);
  }

  private combineWithPrevious(filter: Filter) {
    const timeDimension: Dimension = this.getTimeDimension();
    const timeFilter: FilterClause = filter.getClauseForDimension(timeDimension);
    if (!timeFilter || !(timeFilter instanceof FixedTimeFilterClause)) {
      throw new Error("Can't combine current time filter with previous period without time filter");
    }
    return filter.setClause(this.combinePeriods(timeFilter));
  }

  public getTimeShiftEnv(timekeeper: Timekeeper): TimeShiftEnv {
    const timeDimension = this.getTimeDimension();
    if (!this.hasComparison()) {
      return { type: TimeShiftEnvType.CURRENT };
    }

    const currentFilter = toExpression(this.currentTimeFilter(timekeeper), timeDimension);
    const previousFilter = toExpression(this.previousTimeFilter(timekeeper), timeDimension);
    return {
      type: TimeShiftEnvType.WITH_PREVIOUS,
      shift: this.timeShift.valueOf(),
      currentFilter,
      previousFilter
    };
  }

  private constrainTimeShift(): Essence {
    const { timeShift, timezone } = this;
    return this.set("timeShift", timeShift.constrainToFilter(this.timeFilter(), timezone));
  }

  public getEffectiveFilter(
    timekeeper: Timekeeper,
    { combineWithPrevious = false, unfilterDimension = null }: EffectiveFilterOptions = {}): Filter {
    const { dataCube, timezone } = this;
    let filter = this.filter;
    if (unfilterDimension) filter = filter.removeClause(unfilterDimension.name);
    filter = filter.getSpecificFilter(timekeeper.now(), getMaxTime(dataCube, timekeeper), timezone);
    if (combineWithPrevious) {
      filter = this.combineWithPrevious(filter);
    }
    return filter;
  }

  public hasComparison(): boolean {
    return !this.timeShift.isEmpty();
  }

  private combinePeriods(timeFilter: FixedTimeFilterClause): TimeFilterClause {
    const { timezone, timeShift } = this;
    const duration = timeShift.valueOf();
    return timeFilter.update("values", values =>
      values.flatMap(({ start, end }) =>
        [
          new DateRange({ start, end }),
          new DateRange({ start: duration.shift(start, timezone, -1), end: duration.shift(end, timezone, -1) })
        ]));
  }

  public timeFilter(): TimeFilterClause {
    const { filter, dataCube } = this;
    return Essence.timeFilter(filter, dataCube);
  }

  private fixedTimeFilter(timekeeper: Timekeeper): FixedTimeFilterClause {
    const { dataCube, timezone } = this;
    const timeFilter = this.timeFilter();
    if (timeFilter instanceof FixedTimeFilterClause) return timeFilter;
    return timeFilter.evaluate(timekeeper.now(), getMaxTime(dataCube, timekeeper), timezone);
  }

  public currentTimeFilter(timekeeper: Timekeeper): FixedTimeFilterClause {
    return this.fixedTimeFilter(timekeeper);
  }

  private shiftToPrevious(timeFilter: FixedTimeFilterClause): FixedTimeFilterClause {
    const { timezone, timeShift } = this;
    const duration = timeShift.valueOf();
    return timeFilter.update("values", values =>
      values.map(({ start, end }) => new DateRange({
        start: duration.shift(start, timezone, -1),
        end: duration.shift(end, timezone, -1)
      })));
  }

  public previousTimeFilter(timekeeper: Timekeeper): FixedTimeFilterClause {
    const timeFilter = this.fixedTimeFilter(timekeeper);
    return this.shiftToPrevious(timeFilter);
  }

  public getTimeClause(): TimeFilterClause {
    const timeDimension = this.getTimeDimension();
    return this.filter.getClauseForDimension(timeDimension) as TimeFilterClause;
  }

  private concreteSeriesFromSeries(series: Series): ConcreteSeries {
    const { reference } = series;
    const { dataCube } = this;
    const measure = findMeasureByName(dataCube.measures, reference);
    return createConcreteSeries(series, measure, dataCube.measures);
  }

  public findConcreteSeries(key: string): ConcreteSeries {
    const series = this.series.series.find(series => series.key() === key);
    if (!series) return null;
    return this.concreteSeriesFromSeries(series);
  }

  public getConcreteSeries(): List<ConcreteSeries> {
    return this.series.series.map(series => this.concreteSeriesFromSeries(series));
  }

  public differentDataCube(other: Essence): boolean {
    return this.dataCube !== other.dataCube;
  }

  public differentSplits(other: Essence): boolean {
    return !this.splits.equals(other.splits);
  }

  public differentTimeShift(other: Essence): boolean {
    return !this.timeShift.equals(other.timeShift);
  }

  public differentSeries(other: Essence): boolean {
    return !this.series.equals(other.series);
  }

  public differentSettings(other: Essence): boolean {
    return !nullableEquals(this.visualizationSettings, other.visualizationSettings);
  }

  public differentEffectiveFilter(other: Essence, myTimekeeper: Timekeeper, otherTimekeeper: Timekeeper, unfilterDimension: Dimension = null): boolean {
    const myEffectiveFilter = this.getEffectiveFilter(myTimekeeper, { unfilterDimension });
    const otherEffectiveFilter = other.getEffectiveFilter(otherTimekeeper, { unfilterDimension });
    return !myEffectiveFilter.equals(otherEffectiveFilter);
  }

  public getCommonSort(): Sort {
    return this.splits.getCommonSort();
  }

  // Setters

  public changeComparisonShift(timeShift: TimeShift): Essence {
    return this
      .set("timeShift", timeShift)
      .constrainTimeShift()
      .updateSorts();
  }

  public updateDataCube(newDataCube: ClientDataCube): Essence {
    const { dataCube } = this;
    if (dataCube.name === newDataCube.name) return this;

    function setDataCube(essence: Essence): Essence {
      return essence.set("dataCube", newDataCube);
    }

    function constrainProps(essence: Essence): Essence {
      const seriesValidInNewCube = essence.series.constrainToMeasures(newDataCube.measures);
      const newSeriesList = !seriesValidInNewCube.isEmpty()
        ? seriesValidInNewCube
        : getDefaultSeries(newDataCube);

      return essence
        .update("filter", filter => filter.constrainToDimensions(newDataCube.dimensions))
        .set("series", newSeriesList)
        .update("splits", splits => splits.constrainToDimensionsAndSeries(newDataCube.dimensions, newSeriesList))
        .update("pinnedDimensions", pinned => constrainDimensions(pinned, newDataCube))
        .update("pinnedSort", sort => !hasMeasureWithName(newDataCube.measures, sort) ? newDataCube.defaultSortMeasure : sort);
    }

    function adjustVisualization(essence: Essence): Essence {
      const { dataCube, visualization, splits, series, appSettings } = essence;
      const { visualization: newVis } = Essence.getBestVisualization(
        appSettings, dataCube, splits, series, visualization);
      if (newVis === visualization) return essence;
      return essence.changeVisualization(newVis, newVis.visualizationSettings.defaults);
    }

    return thread(
      this,
      setDataCube,
      constrainProps,
      adjustVisualization,
      (essence: Essence) => essence.resolveVisualizationAndUpdate());
  }

  public changeFilter(filter: Filter): Essence {
    const { filter: oldFilter } = this;

    return this
      .set("filter", filter)
      .constrainTimeShift()
      .update("splits", splits => {
        const differentClauses = filter.clauses.filter(clause => {
          const otherClause = oldFilter.clauseForReference(clause.reference);
          return !clause.equals(otherClause);
        });
        return splits.removeBucketingFrom(Set(differentClauses.map(clause => clause.reference)));
      })
      .updateSplitsWithFilter();
  }

  public changeTimezone(newTimezone: Timezone): Essence {
    const { timezone } = this;
    if (timezone === newTimezone) return this;
    return this.set("timezone", newTimezone);
  }

  public convertToSpecificFilter(timekeeper: Timekeeper): Essence {
    const { dataCube, filter, timezone } = this;
    if (!filter.isRelative()) return this;
    return this.changeFilter(filter.getSpecificFilter(timekeeper.now(), getMaxTime(dataCube, timekeeper), timezone));
  }

  private defaultSplitSort(split: Split): Sort {
    const { dataCube, series } = this;
    const dimension = findDimensionByName(dataCube.dimensions, split.reference);
    const { sortStrategy, name, kind } = dimension;
    if (sortStrategy === "self" || sortStrategy === name) {
      return new DimensionSort({ reference: name, direction: SortDirection.ascending });
    }
    if (sortStrategy && series.hasMeasureSeries(sortStrategy)) {
      return new SeriesSort({ reference: sortStrategy, direction: SortDirection.descending });
    }
    if (kind === "time") {
      return new DimensionSort({ reference: name, direction: SortDirection.ascending });
    }
    return new SeriesSort({ reference: this.defaultSort(), direction: SortDirection.descending });
  }

  private setSortOnSplits(splits: Splits): Splits {
    return splits.update("splits", list => list.map(split => {
      return isSortEmpty(split.sort) ? split.set("sort", this.defaultSplitSort(split)) : split;
    }));
  }

  public changeSplits(splits: Splits, strategy: VisStrategy): Essence {
    const { splits: oldSplits, appSettings, dataCube, visualization, visResolve, filter, series } = this;

    const newSplits = this.setSortOnSplits(splits).updateWithFilter(filter, dataCube.dimensions);

    function adjustStrategy(strategy: VisStrategy): VisStrategy {
      // If in manual mode stay there, keep the vis regardless of suggested strategy
      if (visResolve.isManual()) {
        return VisStrategy.KeepAlways;
      }
      if (oldSplits.length() > 0 && newSplits.length() !== 0) {
        return VisStrategy.UnfairGame;
      }
      return strategy;
    }

    function adjustVisualization(essence: Essence): Essence {
      if (adjustStrategy(strategy) !== VisStrategy.FairGame) return essence;
      const { visualization: newVis } = Essence.getBestVisualization(appSettings, dataCube, newSplits, series, visualization);
      if (newVis === visualization) return essence;
      return essence.changeVisualization(newVis, newVis.visualizationSettings.defaults);
    }

    return thread(
      this,
      (essence: Essence) => essence.set("splits", newSplits),
      adjustVisualization,
      (essence: Essence) => essence.resolveVisualizationAndUpdate());
  }

  public changeSplit(splitCombine: Split, strategy: VisStrategy): Essence {
    return this.changeSplits(Splits.fromSplit(splitCombine), strategy);
  }

  public addSplit(split: Split, strategy: VisStrategy): Essence {
    return this.changeSplits(this.splits.addSplit(split), strategy);
  }

  public removeSplit(split: Split, strategy: VisStrategy): Essence {
    return this.changeSplits(this.splits.removeSplit(split), strategy);
  }

  addSeries(series: Series): Essence {
    return this.changeSeriesList(this.series.addSeries(series));
  }

  removeSeries(series: Series): Essence {
    return this.changeSeriesList(this.series.removeSeries(series));
  }

  changeSeriesList(series: SeriesList): Essence {
    return this
      .set("series", series)
      .updateSorts()
      .resolveVisualizationAndUpdate();
  }

  public defaultSort(): string {
    return Essence.defaultSortReference(this.series, this.dataCube);
  }

  private updateSorts(): Essence {
    const seriesRefs = Set(this.series.series.map(series => series.reference));
    return this
      .update("pinnedSort", sort => {
        if (seriesRefs.has(sort)) return sort;
        return this.defaultSort();
      })
      .update("splits", splits => splits.update("splits", splits => splits.map((split: Split) => {
        const { sort } = split;
        const { type, reference } = sort;
        switch (type) {
          case SortType.DIMENSION:
            return split;
          case SortType.SERIES: {
            const measureSort = sort as SeriesSort;
            if (!seriesRefs.has(reference)) {
              const measureSortRef = this.defaultSort();
              if (measureSortRef) {
                return split.changeSort(new SeriesSort({
                  reference: measureSortRef
                }));
              }
              return split.changeSort(new DimensionSort({
                reference: split.reference
              }));
            }
            if (measureSort.period !== SeriesDerivation.CURRENT && !this.hasComparison()) {
              return split.update("sort", (sort: SeriesSort) =>
                sort.set("period", SeriesDerivation.CURRENT));
            }
            return split;
          }
        }
      })));
  }

  public updateSplitsWithFilter(): Essence {
    const { filter, dataCube: { dimensions }, splits } = this;
    const newSplits = splits.updateWithFilter(filter, dimensions);
    if (splits === newSplits) return this;
    return this.set("splits", newSplits).resolveVisualizationAndUpdate();
  }

  public changeVisualization(visualization: VisualizationManifest, settings: VisualizationSettings = visualization.visualizationSettings.defaults): Essence {
    return this
      .set("visualization", visualization)
      .set("visualizationSettings", settings)
      .resolveVisualizationAndUpdate();
  }

  // NOTE: Pass appsettings to all callers. Probably all callers are from Clicker object
  public resolveVisualizationAndUpdate() {
    const { visualization, splits, dataCube, series, appSettings } = this;
    const result = resolveVisualization({ appSettings, dataCube, visualization, splits, series });
    return this
      .set("visResolve", result.visResolve)
      .set("visualization", result.visualization)
      .set("splits", result.splits);
  }

  public pin({ name }: Dimension): Essence {
    return this.update("pinnedDimensions", pinned => pinned.add(name));
  }

  public unpin({ name }: Dimension): Essence {
    return this.update("pinnedDimensions", pinned => pinned.remove(name));
  }

  public changePinnedSortSeries(series: Series): Essence {
    return this.set("pinnedSort", series.plywoodKey());
  }

  public seriesSortOns(withTimeShift?: boolean): List<SortOn> {
    const series = this.getConcreteSeries();
    const addPrevious = withTimeShift && this.hasComparison();
    if (!addPrevious) return series.map(series => new SeriesSortOn(series));
    return series.flatMap(series => {
      return [
        new SeriesSortOn(series),
        new SeriesSortOn(series, SeriesDerivation.PREVIOUS),
        new SeriesSortOn(series, SeriesDerivation.DELTA)
      ];
    });
  }

  public getPinnedSortSeries(): ConcreteSeries {
    return this.findConcreteSeries(this.pinnedSort);
  }

  public description(timekeeper: Timekeeper): string {
    const timeFilter = this.currentTimeFilter(timekeeper);
    const { start, end } = timeFilter.values.first();
    const timezone = this.timezone;

    return `${this.dataCube.name}_${formatUrlSafeDateTime(start, timezone)}_${formatUrlSafeDateTime(end, timezone)}`;
  }
}
