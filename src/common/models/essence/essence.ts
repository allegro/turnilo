/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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
import { List, OrderedSet, Record as ImmutableRecord } from "immutable";
import { Expression, RefExpression, Set, SortExpression, TimeRange } from "plywood";
import { visualizationIndependentEvaluator } from "../../utils/rules/visualization-independent-evaluator";
import { Colors } from "../colors/colors";
import { DataCube } from "../data-cube/data-cube";
import { Dimension } from "../dimension/dimension";
import { FilterClause, FixedTimeFilterClause, isTimeFilter, TimeFilterClause } from "../filter-clause/filter-clause";
import { Filter } from "../filter/filter";
import { Highlight } from "../highlight/highlight";
import { Manifest, Resolve } from "../manifest/manifest";
import { Measure } from "../measure/measure";
import { SplitCombine } from "../split-combine/split-combine";
import { Splits } from "../splits/splits";
import { TimeShift } from "../time-shift/time-shift";
import { Timekeeper } from "../timekeeper/timekeeper";

function constrainDimensions(dimensions: OrderedSet<string>, dataCube: DataCube): OrderedSet<string> {
  return <OrderedSet<string>> dimensions.filter(dimensionName => Boolean(dataCube.getDimension(dimensionName)));
}

function constrainMeasures(measures: OrderedSet<string>, dataCube: DataCube): OrderedSet<string> {
  return <OrderedSet<string>> measures.filter(measureName => Boolean(dataCube.getMeasure(measureName)));
}

function addToSetInOrder<T = string>(order: List<T>, setToAdd: OrderedSet<T>, thing: T): OrderedSet<T> {
  return OrderedSet(order.toArray().filter(name => setToAdd.has(name) || name === thing));
}

function getEffectiveMultiMeasureMode(multiMeasureMode: boolean, visualization?: Manifest) {
  const visualizationNeedsMulti = visualization != null && visualization.measureModeNeed === "multi";
  return multiMeasureMode || visualizationNeedsMulti;
}

export interface VisualizationAndResolve {
  visualization: Manifest;
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

type MeasureId = string;
type DimensionId = string;

interface MeasuresDefinition {
  isMulti: boolean;
  single: MeasureId;
  multi: OrderedSet<MeasureId>;
}

export type Measures = ImmutableRecord<MeasuresDefinition> & Readonly<MeasuresDefinition>;

export const createMeasures = ImmutableRecord<MeasuresDefinition>({ isMulti: false, multi: OrderedSet.of(), single: null });

export interface EssenceValue {
  visualizations: Manifest[];
  dataCube: DataCube;
  visualization: Manifest;
  timezone: Timezone;
  filter: Filter;
  timeShift: TimeShift;
  splits: Splits;
  measures: Measures;
  pinnedDimensions: OrderedSet<DimensionId>;
  colors: Colors;
  pinnedSort: string;
  compare: Filter;
  highlight: Highlight;
  visResolve?: Resolve;
}

const defaultEssence: EssenceValue = {
  visualizations: [],
  dataCube: null,
  visualization: null,
  timezone: Timezone.UTC,
  filter: null,
  splits: null,
  measures: null,
  pinnedDimensions: OrderedSet([]),
  pinnedSort: null,
  colors: null,
  highlight: null,
  compare: null,
  timeShift: TimeShift.empty(),
  visResolve: null
};

export interface EssenceContext {
  dataCube: DataCube;
  visualizations: Manifest[];
}

export interface EffectiveFilterOptions {
  highlightId?: string;
  unfilterDimension?: Dimension;
  combineWithPrevious?: boolean;
}

type VisualizationResolverResult = Pick<EssenceValue, "splits" | "visualization" | "colors" | "visResolve">;
type VisualizationResolverParameters = Pick<EssenceValue, "visualization" | "visualizations" | "dataCube" | "splits" | "colors" | "measures">;

function resolveVisualization({ visualization, visualizations, dataCube, splits, colors, measures }: VisualizationResolverParameters): VisualizationResolverResult {
  let visResolve: Resolve;
  if (visualizations) {
    // Place vis here because it needs to know about splits and colors (and maybe later other things)
    if (!visualization) {
      const visAndResolve = Essence.getBestVisualization(visualizations, dataCube, splits, colors, null);
      visualization = visAndResolve.visualization;
    }

    const ruleVariables = { dataCube, splits, colors, isSelectedVisualization: true };
    visResolve = visualization.evaluateRules(ruleVariables);
    if (visResolve.isAutomatic()) {
      const adjustment = visResolve.adjustment;
      splits = adjustment.splits;
      colors = adjustment.colors || null;
      visResolve = visualization.evaluateRules({ ...ruleVariables, splits, colors });

      if (!visResolve.isReady()) {
        throw new Error(visualization.title + " must be ready after automatic adjustment");
      }
    }

    if (visResolve.isReady()) {
      const effectiveMultiMeasureMode = getEffectiveMultiMeasureMode(measures.isMulti, visualization);
      visResolve = visualizationIndependentEvaluator({ dataCube, multiMeasureMode: effectiveMultiMeasureMode, selectedMeasures: measures.multi });
    }
  }
  return { visualization, splits, colors, visResolve };
}

export class Essence extends ImmutableRecord<EssenceValue>(defaultEssence) {

  static getBestVisualization(
    visualizations: Manifest[],
    dataCube: DataCube,
    splits: Splits,
    colors: Colors,
    currentVisualization: Manifest
  ): VisualizationAndResolve {
    const visAndResolves = visualizations.map(visualization => {
      const isSelectedVisualization = visualization === currentVisualization;
      const ruleVariables = { dataCube, splits, colors, isSelectedVisualization };
      return {
        visualization,
        resolve: visualization.evaluateRules(ruleVariables)
      };
    });

    return visAndResolves.sort((vr1, vr2) => Resolve.compare(vr1.resolve, vr2.resolve))[0];
  }

  static fromDataCube(dataCube: DataCube, context: EssenceContext): Essence {
    const essence = new Essence({
      dataCube: context.dataCube,
      visualizations: context.visualizations,
      visualization: null,
      timezone: dataCube.getDefaultTimezone(),
      filter: null,
      timeShift: TimeShift.empty(),
      splits: dataCube.getDefaultSplits(),
      measures: createMeasures({ isMulti: false, single: dataCube.getDefaultSortMeasure(), multi: dataCube.getDefaultSelectedMeasures() }),
      pinnedDimensions: dataCube.getDefaultPinnedDimensions(),
      colors: null,
      pinnedSort: dataCube.getDefaultSortMeasure(),
      compare: null,
      highlight: null
    });

    return essence.updateSplitsWithFilter();
  }

  public visResolve: Resolve;

  constructor(parameters: EssenceValue) {
    const {
      filter,
      visualizations,
      dataCube,
      timezone,
      timeShift,
      measures,
      pinnedDimensions,
      pinnedSort,
      compare,
      highlight
    } = parameters;

    // TODO: that's stupid!
    if (!dataCube) throw new Error("Essence must have a dataCube");
    const { visResolve, visualization, colors, splits } = resolveVisualization(parameters);

    function hasNoMeasureOrMeasureIsSelected(highlight: Highlight): boolean {
      if (!highlight || !highlight.measure) {
        return true;
      }

      const { measure } = highlight;
      return measures.isMulti ? measures.multi.has(measure) : measure === measures.single;
    }

    const newHighlight = hasNoMeasureOrMeasureIsSelected(highlight) ? highlight : null;

    super({
      ...parameters,
      visualizations,
      dataCube,
      visualization,
      timezone: timezone || Timezone.UTC,
      timeShift,
      splits: splits && splits.constrainToDimensionsAndMeasures(dataCube.dimensions, dataCube.measures),
      filter: filter && filter.constrainToDimensions(dataCube.dimensions),
      measures: measures.update("multi", multi => constrainMeasures(multi, dataCube)),
      pinnedDimensions: constrainDimensions(pinnedDimensions, dataCube),
      pinnedSort: dataCube.getMeasure(pinnedSort) ? pinnedSort : dataCube.getDefaultSortMeasure(),
      colors,
      highlight: newHighlight && newHighlight.constrainToDimensions(dataCube.dimensions, dataCube.timeAttribute),
      compare,
      visResolve
    });
  }

  public toString(): string {
    return "[Essence]";
  }

  // getters
  public getTimeAttribute(): RefExpression {
    return this.dataCube.timeAttribute;
  }

  public getTimeDimension(): Dimension {
    return this.dataCube.getTimeDimension();
  }

  public evaluateSelection(filter: TimeFilterClause, timekeeper: Timekeeper): FixedTimeFilterClause {
    if (filter instanceof FixedTimeFilterClause) return filter;
    const { timezone, dataCube } = this;
    return filter.evaluate(timekeeper.now(), dataCube.getMaxTime(timekeeper), timezone);
  }

  private combineWithPrevious(filter: Filter) {
    const timeDimension: Dimension = this.getTimeDimension();
    const timeFilter: FilterClause = filter.getClauseForDimension(timeDimension);
    if (!timeFilter || !(timeFilter instanceof FixedTimeFilterClause)) {
      throw new Error("Can't combine current time filter with previous period without time filter");
    }
    return filter.setClause(this.combinePeriods(timeFilter));
  }

  public getEffectiveFilter(
    timekeeper: Timekeeper,
    { highlightId = null, combineWithPrevious = false, unfilterDimension = null }: EffectiveFilterOptions = {}): Filter {
    const { dataCube, highlight, timezone } = this;
    let filter = this.filter;
    if (highlight && (highlightId !== highlight.owner)) filter = highlight.applyToFilter(filter);
    if (unfilterDimension) filter = filter.removeClause(unfilterDimension.name);
    filter = filter.getSpecificFilter(timekeeper.now(), dataCube.getMaxTime(timekeeper), timezone);
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
          { start, end },
          { start: duration.shift(start, timezone, -1), end: duration.shift(end, timezone, -1) }
        ]));
  }

  private timeFilter(timekeeper: Timekeeper): FixedTimeFilterClause {
    const { dataCube, timezone } = this;
    const timeDimension: Dimension = this.getTimeDimension();
    const timeFilter = this.filter.getClauseForDimension(timeDimension);
    if (!timeFilter || !isTimeFilter(timeFilter)) throw Error(`Incorrect time filter: ${timeFilter}`);
    if (timeFilter instanceof FixedTimeFilterClause) return timeFilter;
    return timeFilter.evaluate(timekeeper.now(), dataCube.getMaxTime(timekeeper), timezone);
  }

  // TODO: should return just filter clause, overlap should be done in makeQuery
  public currentTimeFilter(timekeeper: Timekeeper): Expression {
    const timeFilter = this.timeFilter(timekeeper);
    return this.dataCube.timeAttribute.overlap(timeFilter.getLiteralSet());
  }

  private shiftToPrevious(timeFilter: FixedTimeFilterClause): FixedTimeFilterClause {
    const { timezone, timeShift } = this;
    const duration = timeShift.valueOf();
    return timeFilter.update("values", values =>
      values.map(({ start, end }) => ({
        start: duration.shift(start, timezone, -1),
        end: duration.shift(end, timezone, -1)
      })));
  }

  // TODO: should return just filter clause, overlap should be done in makeQuery
  public previousTimeFilter(timekeeper: Timekeeper): Expression {
    const timeFilter = this.timeFilter(timekeeper);
    const shiftedFilterExpression = this.shiftToPrevious(timeFilter);
    return this.dataCube.timeAttribute.overlap(shiftedFilterExpression);
  }

  public getTimeClause(): TimeFilterClause {
    const timeDimension = this.getTimeDimension();
    return this.filter.getClauseForDimension(timeDimension) as TimeFilterClause;
  }

  public isFixedMeasureMode(): boolean {
    return this.visualization.measureModeNeed !== "any";
  }

  public getEffectiveMultiMeasureMode(): boolean {
    const { measureModeNeed } = this.visualization;
    if (measureModeNeed !== "any") {
      return measureModeNeed === "multi";
    }
    return this.measures.isMulti;
  }

  public getEffectiveMeasures(): List<Measure> {
    if (this.getEffectiveMultiMeasureMode()) {
      return this.getMeasures();
    } else {
      return List([this.dataCube.getMeasure(this.measures.single)]);
    }
  }

  public getMeasures(): List<Measure> {
    const { dataCube, measures: { multi } } = this;
    return multi.map(measureName => dataCube.getMeasure(measureName)).toList();
  }

  public getEffectiveSelectedMeasure(): OrderedSet<string> {
    if (this.getEffectiveMultiMeasureMode()) {
      return this.measures.multi;
    } else {
      return OrderedSet([this.measures.single]);
    }
  }

  public differentDataCube(other: Essence): boolean {
    return this.dataCube !== other.dataCube;
  }

  public differentTimezone(other: Essence): boolean {
    return !this.timezone.equals(other.timezone);
  }

  public differentTimezoneMatters(other: Essence): boolean {
    return this.splits.timezoneDependant() && this.differentTimezone(other);
  }

  public differentSplits(other: Essence): boolean {
    return !this.splits.equals(other.splits);
  }

  public differentEffectiveSplits(other: Essence): boolean {
    return this.differentSplits(other) || this.differentTimezoneMatters(other);
  }

  public differentTimeShift(other: Essence): boolean {
    return !this.timeShift.equals(other.timeShift);
  }

  public differentColors(other: Essence): boolean {
    if (Boolean(this.colors) !== Boolean(other.colors)) return true;
    if (!this.colors) return false;
    return !this.colors.equals(other.colors);
  }

  public newEffectiveMeasures(other: Essence): boolean {
    return !this.getEffectiveSelectedMeasure().isSubset(other.getEffectiveSelectedMeasure());
  }

  public differentEffectiveFilter(other: Essence, myTimekeeper: Timekeeper, otherTimekeeper: Timekeeper, highlightId: string = null, unfilterDimension: Dimension = null): boolean {
    const myEffectiveFilter = this.getEffectiveFilter(myTimekeeper, { highlightId, unfilterDimension });
    const otherEffectiveFilter = other.getEffectiveFilter(otherTimekeeper, { highlightId, unfilterDimension });
    return !myEffectiveFilter.equals(otherEffectiveFilter);
  }

  public highlightOn(owner: string, measure?: string): boolean {
    const { highlight } = this;
    if (!highlight) return false;
    return highlight.owner === owner && (!measure || highlight.measure === measure);
  }

  public highlightOnDifferentMeasure(owner: string, measure: string): boolean {
    const { highlight } = this;
    if (!highlight) return false;
    return highlight.owner === owner && measure && highlight.measure !== measure;
  }

  public getSingleHighlightSet(): Set {
    const { highlight } = this;
    if (!highlight) return null;
    return highlight.delta.getSingleClauseSet();
  }

  public getCommonSort(): SortExpression {
    return this.splits.getCommonSort(this.dataCube.dimensions);
  }

  // Setters

  public changeComparisonShift(timeShift: TimeShift): Essence {
    return this.set("timeShift", timeShift);
  }

  public updateDataCube(newDataCube: DataCube): Essence {
    const { dataCube } = this;
    if (dataCube.equals(newDataCube)) return this;
    return this
      .set("dataCube", newDataCube)
      // Make sure that all the elements of state are still valid
      /*
        TODO: Tthis line was here and there was some check for old timeFilter, really don't know what was that for.
      .update("filter", filter => filter.constrainToDimensions(newDataCube.dimensions, newDataCube.timeAttribute, dataCube.timeAttribute))
      */
      .update("filter", filter => filter.constrainToDimensions(newDataCube.dimensions))
      .update("splits", splits => splits.constrainToDimensionsAndMeasures(newDataCube.dimensions, newDataCube.measures))
      .updateIn(["measures", "multi"], multi => {
        const constrained = constrainMeasures(multi, newDataCube);
        return constrained.count() > 0 ? constrained : newDataCube.getDefaultSelectedMeasures();
      })
      .update("pinnedDimensions", pinned => constrainDimensions(pinned, newDataCube))
      .update("colors", colors => colors && !newDataCube.getDimension(colors.dimension) ? null : colors)
      .update("pinnedSort", sort => !newDataCube.getMeasure(sort) ? newDataCube.getDefaultSortMeasure() : sort)
      .update("compare", compare => compare && compare.constrainToDimensions(newDataCube.dimensions))
      .update("highlight", highlight => highlight && highlight.constrainToDimensions(newDataCube.dimensions, newDataCube.timeAttribute))
      .resolveVisualizationAndUpdate();
  }

  public changeFilter(filter: Filter, removeHighlight = false): Essence {
    const { filter: oldFilter } = this;

    return this
      .set("filter", filter)
      .update("highlight", highlight => removeHighlight ? null : highlight)
      .update("splits", splits => {
        const differentAttributes = filter.clauses.filter(clause => {
          const otherClause = oldFilter.clauseForReference(clause.reference);
          return !clause.equals(otherClause);
        });
        return splits.removeBucketingFrom(differentAttributes);
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
    return this.changeFilter(filter.getSpecificFilter(timekeeper.now(), dataCube.getMaxTime(timekeeper), timezone));
  }

  public changeSplits(splits: Splits, strategy: VisStrategy): Essence {
    const { visualizations, highlight, dataCube, visualization, visResolve, filter, colors } = this;

    splits = splits.updateWithFilter(filter, dataCube.dimensions);

    // If in manual mode stay there, keep the vis regardless of suggested strategy
    if (visResolve.isManual()) {
      strategy = VisStrategy.KeepAlways;
    }
    if (this.splits.length() > 0 && splits.length() !== 0) {
      strategy = VisStrategy.UnfairGame;
    }

    let changedVisualisation: Manifest;
    if (strategy !== VisStrategy.KeepAlways && strategy !== VisStrategy.UnfairGame) {
      const currentVisualization = (strategy === VisStrategy.FairGame ? null : visualization);
      const visAndResolve = Essence.getBestVisualization(visualizations, dataCube, splits, colors, currentVisualization);
      changedVisualisation = visAndResolve.visualization;
    }

    function resetHighlight(essence: Essence): Essence {
      return essence
        .update("filter", filter => highlight.applyToFilter(filter))
        .set("highlight", null);
    }

    const withoutHighlight = highlight ? resetHighlight(this) : this;

    return withoutHighlight
      .set("splits", splits)
      .changeVisualization(changedVisualisation || visualization);
  }

  public changeSplit(splitCombine: SplitCombine, strategy: VisStrategy): Essence {
    return this.changeSplits(Splits.fromSplitCombine(splitCombine), strategy);
  }

  public addSplit(split: SplitCombine, strategy: VisStrategy): Essence {
    return this.changeSplits(this.splits.addSplit(split), strategy);
  }

  public removeSplit(split: SplitCombine, strategy: VisStrategy): Essence {
    return this.changeSplits(this.splits.removeSplit(split), strategy);
  }

  public updateSplitsWithFilter(): Essence {
    const { filter, dataCube: { dimensions }, splits } = this;
    const newSplits = splits.updateWithFilter(filter, dimensions);
    if (splits === newSplits) return this;
    return this.set("splits", newSplits).resolveVisualizationAndUpdate();
  }

  public changeColors(colors: Colors): Essence {
    return this.set("colors", colors).resolveVisualizationAndUpdate();
  }

  public changeVisualization(visualization: Manifest): Essence {
    return this.set("visualization", visualization).resolveVisualizationAndUpdate();
  }

  public resolveVisualizationAndUpdate() {
    const { visualization, colors, splits, dataCube, visualizations, measures } = this;
    const result = resolveVisualization({ colors, splits, dataCube, visualizations, measures, visualization });
    return this
      .set("visResolve", result.visResolve)
      .set("colors", result.colors)
      .set("visualization", result.visualization)
      .set("splits", result.splits);
  }

  public pin({ name }: Dimension): Essence {
    return this.update("pinnedDimensions", pinned => pinned.add(name));
  }

  public unpin({ name }: Dimension): Essence {
    return this.update("pinnedDimensions", pinned => pinned.remove(name));
  }

  public getPinnedSortMeasure(): Measure {
    return this.dataCube.getMeasure(this.pinnedSort);
  }

  public changePinnedSortMeasure({ name }: Measure): Essence {
    return this.set("pinnedSort", name);
  }

  private setMultiMeasureMode(): Essence {
    const { measures: { multi, single } } = this;
    const multiModeEssence = this.setIn(["measure", "isMulti"], true);
    // Ensure that the singleMeasure is in the selectedMeasures
    if (multi.count() > 0 && !multi.has(single)) {
      return multiModeEssence.setIn(["measure", "single"], multi.first());
    }
    return multiModeEssence;
  }

  private setSingleMeasureMode(): Essence {
    const { measures: { multi, single }, dataCube } = this;
    return this
      .setIn(["measure", "isMulti"], false)
      .setIn(["measures", "multi"], addToSetInOrder(dataCube.measures.getMeasureNames(), multi, single));
  }

  public toggleMeasureMode(): Essence {
    const essenceWithMode = this.measures.isMulti ? this.setSingleMeasureMode() : this.setMultiMeasureMode();
    return essenceWithMode.resolveVisualizationAndUpdate();
  }

  private selectMeasure({ name }: Measure): Essence {
    if (name === this.measures.single) return this;
    return this
      .update("splits", splits => splits.changeSortIfOnMeasure(this.measures.single, name))
      .set("pinnedSort", name)
      .setIn(["measures", "single"], name);
  }

  private toggleMeasure({ name }: Measure): Essence {
    const { dataCube } = this;
    return this.update("measures", measures =>
      measures
        .update("multi", multi => {
          if (multi.has(name)) {
            return multi.delete(name);
          } else {
            return addToSetInOrder(dataCube.measures.getMeasureNames(), multi, name);
          }
        }));
  }

  public toggleEffectiveMeasure(measure: Measure): Essence {
    const isMulti = this.getEffectiveMultiMeasureMode();
    const toggledEssence = isMulti ? this.toggleMeasure(measure) : this.selectMeasure(measure);
    return toggledEssence.resolveVisualizationAndUpdate();
  }

  public acceptHighlight(): Essence {
    const { highlight } = this;
    if (!highlight) return this;
    return this.changeFilter(highlight.applyToFilter(this.filter), true);
  }

  public changeHighlight(owner: string, measure: string, delta: Filter): Essence {
    const { highlight, filter } = this;

    // If there is already a highlight from someone else accept it
    const differentHighlight = highlight && highlight.owner !== owner;
    const essence = differentHighlight ? this.changeFilter(highlight.applyToFilter(filter)) : this;
    return essence.set("highlight", new Highlight({ owner, delta, measure }));
  }

  public dropHighlight(): Essence {
    return this.set("highlight", null);
  }
}
