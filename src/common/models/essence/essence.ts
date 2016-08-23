/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { List, OrderedSet, Iterable } from 'immutable';
import { compressToBase64, decompressFromBase64 } from 'lz-string';
import { Class, Instance, isInstanceOf, immutableEqual } from 'immutable-class';
import { Timezone, Duration, minute } from 'chronoshift';
import { $, Expression, RefExpression, TimeRange, ApplyAction, SortAction, Set, findByName } from 'plywood';
import { hasOwnProperty } from '../../../common/utils/general/general';
import { DataCube } from '../data-cube/data-cube';
import { Filter, FilterJS } from '../filter/filter';
import { FilterClause } from '../filter-clause/filter-clause';
import { Highlight, HighlightJS } from '../highlight/highlight';
import { Splits, SplitsJS } from '../splits/splits';
import { SplitCombine } from '../split-combine/split-combine';
import { Dimension } from '../dimension/dimension';
import { Measure } from '../measure/measure';
import { Timekeeper } from '../timekeeper/timekeeper';
import { Colors, ColorsJS } from '../colors/colors';
import { Manifest, Resolve } from '../manifest/manifest';

const HASH_VERSION = 2;

function constrainDimensions(dimensions: OrderedSet<string>, dataCube: DataCube): OrderedSet<string> {
  return <OrderedSet<string>>dimensions.filter((dimensionName) => Boolean(dataCube.getDimension(dimensionName)));
}

function constrainMeasures(measures: OrderedSet<string>, dataCube: DataCube): OrderedSet<string> {
  return <OrderedSet<string>>measures.filter((measureName) => Boolean(dataCube.getMeasure(measureName)));
}

function addToSetInOrder<T>(order: Iterable<any, T>, setToAdd: OrderedSet<T>, thing: T): OrderedSet<T> {
  return OrderedSet(order.toArray().filter((name) => setToAdd.has(name) || name === thing));
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

export interface EssenceValue {
  visualizations?: Manifest[];
  dataCube?: DataCube;

  visualization: Manifest;
  timezone: Timezone;
  filter: Filter;
  splits: Splits;
  multiMeasureMode: boolean;
  singleMeasure: string;
  selectedMeasures: OrderedSet<string>;
  pinnedDimensions: OrderedSet<string>;
  colors: Colors;
  pinnedSort: string;
  compare: Filter;
  highlight: Highlight;
}

export interface EssenceJS {
  visualization?: string;
  timezone?: string;
  filter?: FilterJS;
  splits?: SplitsJS;
  multiMeasureMode?: boolean;
  singleMeasure?: string;
  selectedMeasures?: string[];
  pinnedDimensions?: string[];
  colors?: ColorsJS;
  pinnedSort?: string;
  compare?: FilterJS;
  highlight?: HighlightJS;
}

export interface EssenceContext {
  dataCube: DataCube;
  visualizations: Manifest[];
}

var check: Class<EssenceValue, EssenceJS>;
export class Essence implements Instance<EssenceValue, EssenceJS> {
  static isEssence(candidate: any): candidate is Essence {
    return isInstanceOf(candidate, Essence);
  }

  static getBestVisualization(visualizations: Manifest[], dataCube: DataCube, splits: Splits, colors: Colors, currentVisualization: Manifest): VisualizationAndResolve {
    var visAndResolves = visualizations.map((visualization) => {
      return {
        visualization,
        resolve: visualization.handleCircumstance(dataCube, splits, colors, visualization === currentVisualization)
      };
    });

    return visAndResolves.sort((vr1, vr2) => Resolve.compare(vr1.resolve, vr2.resolve))[0];
  }

  static fromHash(hash: string, context: EssenceContext): Essence {
    var parts = hash.split('/');
    if (parts.length < 3) return null;
    var visualization = parts.shift();
    var version = parseInt(parts.shift(), 10);

    if (version > HASH_VERSION) return null;

    var jsArray: any[] = null;
    try {
      jsArray = JSON.parse('[' + decompressFromBase64(parts.join('/')) + ']');
    } catch (e) {
      return null;
    }

    if (!Array.isArray(jsArray)) return null;

    if (version === 1) { // Upgrade to version 2
      jsArray.splice(3, 0, false, null); // Insert null at position 3 (between splits and selectedMeasures)
    }

    var jsArrayLength = jsArray.length;
    if (!(8 <= jsArrayLength && jsArrayLength <= 11)) return null;

    var essence: Essence;
    try {
      essence = Essence.fromJS({
        visualization: visualization,
        timezone: jsArray[0],
        filter: jsArray[1],
        splits: jsArray[2],
        multiMeasureMode: jsArray[3],
        singleMeasure: jsArray[4],
        selectedMeasures: jsArray[5],
        pinnedDimensions: jsArray[6],
        pinnedSort: jsArray[7],
        colors: jsArray[8] || null,
        compare: jsArray[9] || null,
        highlight: jsArray[10] || null
      }, context);
    } catch (e) {
      return null;
    }

    return essence;
  }

  static fromDataCube(dataCube: DataCube, context: EssenceContext): Essence {
    var essence = new Essence({
      dataCube: context.dataCube,
      visualizations: context.visualizations,

      visualization: null,
      timezone: dataCube.getDefaultTimezone(),
      filter: null,
      splits: dataCube.getDefaultSplits(),
      multiMeasureMode: false,
      singleMeasure: dataCube.getDefaultSortMeasure(),
      selectedMeasures: dataCube.getDefaultSelectedMeasures(),
      pinnedDimensions: dataCube.getDefaultPinnedDimensions(),
      colors: null,
      pinnedSort: dataCube.getDefaultSortMeasure(),
      compare: null,
      highlight: null
    });

    return essence.updateSplitsWithFilter();
  }

  static fromJS(parameters: EssenceJS, context?: EssenceContext): Essence {
    if (!context) throw new Error('Essence must have context');
    const { dataCube, visualizations } = context;

    var visualizationName = parameters.visualization;
    if (visualizationName === 'time-series') visualizationName = 'line-chart'; // Back compat (used to be named time-series)
    var visualization = findByName(visualizations, visualizationName);

    var timezone = parameters.timezone ? Timezone.fromJS(parameters.timezone) : null;
    var filter = parameters.filter ? Filter.fromJS(parameters.filter).constrainToDimensions(dataCube.dimensions, dataCube.timeAttribute) : null;
    var splits = Splits.fromJS(parameters.splits || [], dataCube).constrainToDimensionsAndMeasures(dataCube.dimensions, dataCube.measures);

    var defaultSortMeasureName = dataCube.getDefaultSortMeasure();

    var multiMeasureMode = hasOwnProperty(parameters, 'multiMeasureMode') ? parameters.multiMeasureMode : !hasOwnProperty(parameters, 'singleMeasure');
    var singleMeasure = dataCube.getMeasure(parameters.singleMeasure) ? parameters.singleMeasure : defaultSortMeasureName;

    var selectedMeasures = constrainMeasures(OrderedSet(parameters.selectedMeasures || []), dataCube);
    var pinnedDimensions = constrainDimensions(OrderedSet(parameters.pinnedDimensions || []), dataCube);

    var colors = parameters.colors ? Colors.fromJS(parameters.colors) : null;

    var pinnedSort = dataCube.getMeasure(parameters.pinnedSort) ? parameters.pinnedSort : defaultSortMeasureName;

    var compare: Filter = null;
    var compareJS = parameters.compare;
    if (compareJS) {
      compare = Filter.fromJS(compareJS).constrainToDimensions(dataCube.dimensions, dataCube.timeAttribute);
    }

    var highlight: Highlight = null;
    var highlightJS = parameters.highlight;
    if (highlightJS) {
      highlight = Highlight.fromJS(highlightJS).constrainToDimensions(dataCube.dimensions, dataCube.timeAttribute);
    }

    return new Essence({
      dataCube,
      visualizations,

      visualization,
      timezone,
      filter,
      splits,
      multiMeasureMode,
      singleMeasure,
      selectedMeasures,
      pinnedDimensions,
      colors,
      pinnedSort,
      compare,
      highlight
    });
  }


  public dataCube: DataCube;
  public visualizations: Manifest[];

  public visualization: Manifest;
  public timezone: Timezone;
  public filter: Filter;
  public splits: Splits;
  public multiMeasureMode: boolean;
  public singleMeasure: string;
  public selectedMeasures: OrderedSet<string>;
  public pinnedDimensions: OrderedSet<string>;
  public colors: Colors;
  public pinnedSort: string;
  public compare: Filter;
  public highlight: Highlight;

  public visResolve: Resolve;

  constructor(parameters: EssenceValue) {
    var {
      visualizations,
      dataCube,
      visualization,
      timezone,
      filter,
      splits,
      multiMeasureMode,
      singleMeasure,
      selectedMeasures,
      pinnedDimensions,
      colors,
      pinnedSort,
      compare,
      highlight
    } = parameters;

    if (!dataCube) throw new Error('Essence must have a dataCube');

    timezone = timezone || Timezone.UTC;

    if (!filter) {
      filter = dataCube.getDefaultFilter();
    }

    multiMeasureMode = Boolean(multiMeasureMode);

    function visibleMeasure(measureName: string): boolean {
      return multiMeasureMode ? selectedMeasures.has(measureName) : measureName === singleMeasure;
    }

    // Wipe out the highlight if measure is not selected
    if (highlight && highlight.measure && !visibleMeasure(highlight.measure)) {
      highlight = null;
    }

    if (visualizations) {
      // Place vis here because it needs to know about splits and colors (and maybe later other things)
      if (!visualization) {
        var visAndResolve = Essence.getBestVisualization(visualizations, dataCube, splits, colors, null);
        visualization = visAndResolve.visualization;
      }

      var visResolve = visualization.handleCircumstance(dataCube, splits, colors, true);
      if (visResolve.isAutomatic()) {
        var adjustment = visResolve.adjustment;
        splits = adjustment.splits;
        colors = adjustment.colors || null;
        visResolve = visualization.handleCircumstance(dataCube, splits, colors, true);

        if (!visResolve.isReady()) {
          console.log(visResolve);
          throw new Error(visualization.title + ' must be ready after automatic adjustment');
        }
      }
    }

    this.visualizations = visualizations;
    this.dataCube = dataCube;
    this.visualization = visualization;
    this.dataCube = dataCube;
    this.timezone = timezone;
    this.filter = filter;
    this.splits = splits;
    this.multiMeasureMode = multiMeasureMode;
    this.singleMeasure = singleMeasure;
    this.selectedMeasures = selectedMeasures;
    this.pinnedDimensions = pinnedDimensions;
    this.colors = colors;
    this.pinnedSort = pinnedSort;
    this.highlight = highlight;
    this.compare = compare;
    this.visResolve = visResolve;
  }

  public valueOf(): EssenceValue {
    return {
      dataCube: this.dataCube,
      visualizations: this.visualizations,

      visualization: this.visualization,
      timezone: this.timezone,
      filter: this.filter,
      splits: this.splits,
      multiMeasureMode: this.multiMeasureMode,
      singleMeasure: this.singleMeasure,
      selectedMeasures: this.selectedMeasures,
      pinnedDimensions: this.pinnedDimensions,
      colors: this.colors,
      pinnedSort: this.pinnedSort,
      compare: this.compare,
      highlight: this.highlight
    };
  }

  public toJS(): EssenceJS {
    var js: EssenceJS = {
      visualization: this.visualization.name,
      timezone: this.timezone.toJS(),
      filter: this.filter.toJS(),
      splits: this.splits.toJS(),
      singleMeasure: this.singleMeasure,
      selectedMeasures: this.selectedMeasures.toArray(),
      pinnedDimensions: this.pinnedDimensions.toArray()
    };
    if (this.multiMeasureMode) js.multiMeasureMode = true;
    if (this.colors) js.colors = this.colors.toJS();
    var defaultSortMeasure = this.dataCube.getDefaultSortMeasure();
    if (this.pinnedSort !== defaultSortMeasure) js.pinnedSort = this.pinnedSort;
    if (this.compare) js.compare = this.compare.toJS();
    if (this.highlight) js.highlight = this.highlight.toJS();
    return js;
  }

  public toJSON(): EssenceJS {
    return this.toJS();
  }

  public toString(): string {
    return `[Essence]`;
  }

  public equals(other: Essence): boolean {
    return Essence.isEssence(other) &&
      this.dataCube.equals(other.dataCube) &&
      this.visualization.name === other.visualization.name &&
      this.timezone.equals(other.timezone) &&
      this.filter.equals(other.filter) &&
      this.splits.equals(other.splits) &&
      this.multiMeasureMode === other.multiMeasureMode &&
      this.singleMeasure === other.singleMeasure &&
      this.selectedMeasures.equals(other.selectedMeasures) &&
      this.pinnedDimensions.equals(other.pinnedDimensions) &&
      immutableEqual(this.colors, other.colors) &&
      this.pinnedSort === other.pinnedSort &&
      immutableEqual(this.compare, other.compare) &&
      immutableEqual(this.highlight, other.highlight);
  }

  public toHash(): string {
    var js = this.toJS();

    var compressed: any[] = [
      js.timezone,         // 0
      js.filter,           // 1
      js.splits,           // 2
      js.multiMeasureMode, // 3
      js.singleMeasure,    // 4
      js.selectedMeasures, // 5
      js.pinnedDimensions, // 6
      js.pinnedSort        // 7
    ];
    if (js.colors)      compressed[8] = js.colors;
    if (js.compare)     compressed[9] = js.compare;
    if (js.highlight)   compressed[10] = js.highlight;

    var restJSON: string[] = [];
    for (var i = 0; i < compressed.length; i++) {
      restJSON.push(JSON.stringify(compressed[i] || null));
    }

    return [
      js.visualization,
      HASH_VERSION,
      compressToBase64(restJSON.join(','))
    ].join('/');
  }

  public getURL(urlPrefix: string): string {
    return urlPrefix + this.toHash();
  }

  public getTimeAttribute(): RefExpression {
    return this.dataCube.timeAttribute;
  }

  public getTimeDimension(): Dimension {
    return this.dataCube.getTimeDimension();
  }

  public evaluateSelection(selection: Expression, timekeeper: Timekeeper): TimeRange {
    var { timezone, dataCube } = this;
    return FilterClause.evaluate(selection, timekeeper.now(), dataCube.getMaxTime(timekeeper), timezone);
  }

  public evaluateClause(clause: FilterClause, timekeeper: Timekeeper): FilterClause {
    var { timezone, dataCube } = this;
    return clause.evaluate(timekeeper.now(), dataCube.getMaxTime(timekeeper), timezone);
  }

  public getEffectiveFilter(timekeeper: Timekeeper, highlightId: string = null, unfilterDimension: Dimension = null): Filter {
    var { dataCube, filter, highlight, timezone } = this;
    if (highlight && (highlightId !== highlight.owner)) filter = highlight.applyToFilter(filter);
    if (unfilterDimension) filter = filter.remove(unfilterDimension.expression);
    return filter.getSpecificFilter(timekeeper.now(), dataCube.getMaxTime(timekeeper), timezone);
  }

  public getTimeSelection(): Expression {
    const timeAttribute = this.getTimeAttribute();
    return this.filter.getSelection(timeAttribute) as Expression;
  }

  public isFixedMeasureMode(): boolean {
    return this.visualization.measureModeNeed !== 'any';
  }

  public getEffectiveMultiMeasureMode(): boolean {
    const { measureModeNeed } = this.visualization;
    if (measureModeNeed !== 'any') {
      return measureModeNeed === 'multi';
    }
    return this.multiMeasureMode;
  }

  public getEffectiveMeasures(): List<Measure> {
    if (this.getEffectiveMultiMeasureMode()) {
      return this.getMeasures();
    } else {
      return List([this.dataCube.getMeasure(this.singleMeasure)]);
    }
  }

  public getMeasures(): List<Measure> {
    var dataCube = this.dataCube;
    return <List<Measure>>this.selectedMeasures.toList().map(measureName => dataCube.getMeasure(measureName));
  }

  public getEffectiveSelectedMeasure(): OrderedSet<string> {
    if (this.getEffectiveMultiMeasureMode()) {
      return this.selectedMeasures;
    } else {
      return OrderedSet([this.singleMeasure]);
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

  public differentFilter(other: Essence): boolean {
    return !this.filter.equals(other.filter);
  }

  public differentSplits(other: Essence): boolean {
    return !this.splits.equals(other.splits);
  }

  public differentEffectiveSplits(other: Essence): boolean {
    return this.differentSplits(other) || this.differentTimezoneMatters(other);
  }

  public differentColors(other: Essence): boolean {
    if (Boolean(this.colors) !== Boolean(other.colors)) return true;
    if (!this.colors) return false;
    return !this.colors.equals(other.colors);
  }

  public differentSelectedMeasures(other: Essence): boolean {
    return !this.selectedMeasures.equals(other.selectedMeasures);
  }

  public differentEffectiveMeasures(other: Essence): boolean {
    return !this.getEffectiveSelectedMeasure().equals(other.getEffectiveSelectedMeasure());
  }

  public newSelectedMeasures(other: Essence): boolean {
    return !this.selectedMeasures.isSubset(other.selectedMeasures);
  }

  public newEffectiveMeasures(other: Essence): boolean {
    return !this.getEffectiveSelectedMeasure().isSubset(other.getEffectiveSelectedMeasure());
  }

  public differentPinnedDimensions(other: Essence): boolean {
    return !this.pinnedDimensions.equals(other.pinnedDimensions);
  }

  public differentPinnedSort(other: Essence): boolean {
    return this.pinnedSort !== other.pinnedSort;
  }

  public differentCompare(other: Essence): boolean {
    if (Boolean(this.compare) !== Boolean(other.compare)) return true;
    return Boolean(this.compare && !this.compare.equals(other.compare));
  }

  public differentHighligh(other: Essence): boolean {
    if (Boolean(this.highlight) !== Boolean(other.highlight)) return true;
    return Boolean(this.highlight && !this.highlight.equals(other.highlight));
  }

  public differentEffectiveFilter(other: Essence, myTimekeeper: Timekeeper, otherTimekeeper: Timekeeper, highlightId: string = null, unfilterDimension: Dimension = null): boolean {
    var myEffectiveFilter = this.getEffectiveFilter(myTimekeeper, highlightId, unfilterDimension);
    var otherEffectiveFilter = other.getEffectiveFilter(otherTimekeeper, highlightId, unfilterDimension);
    return !myEffectiveFilter.equals(otherEffectiveFilter);
  }

  public highlightOn(owner: string, measure?: string): boolean {
    var { highlight } = this;
    if (!highlight) return false;
    return highlight.owner === owner && (!measure || highlight.measure === measure);
  }

  public highlightOnDifferentMeasure(owner: string, measure: string): boolean {
    var { highlight } = this;
    if (!highlight) return false;
    return highlight.owner === owner && measure && highlight.measure !== measure;
  }

  public getSingleHighlightSet(): Set {
    var { highlight } = this;
    if (!highlight) return null;
    return highlight.delta.getSingleClauseSet();
  }

  public getApplyForSort(sort: SortAction): ApplyAction {
    var sortOn = (<RefExpression>sort.expression).name;
    var sortMeasure = this.dataCube.getMeasure(sortOn);
    if (!sortMeasure) return null;
    return sortMeasure.toApplyAction();
  }

  public getCommonSort(): SortAction {
    return this.splits.getCommonSort(this.dataCube.dimensions);
  }

  public updateDataCube(newDataCube: DataCube): Essence {
    var { dataCube, visualizations } = this;

    if (dataCube.equals(newDataCube)) return this; // nothing to do

    var value = this.valueOf();
    value.dataCube = newDataCube;

    // Make sure that all the elements of state are still valid
    value.filter = value.filter.constrainToDimensions(newDataCube.dimensions, newDataCube.timeAttribute, dataCube.timeAttribute);
    value.splits = value.splits.constrainToDimensionsAndMeasures(newDataCube.dimensions, newDataCube.measures);
    value.selectedMeasures = constrainMeasures(value.selectedMeasures, newDataCube);
    if (value.selectedMeasures.size === 0) {
      value.selectedMeasures = newDataCube.getDefaultSelectedMeasures();
    }

    value.pinnedDimensions = constrainDimensions(value.pinnedDimensions, newDataCube);

    if (value.colors && !newDataCube.getDimension(value.colors.dimension)) {
      value.colors = null;
    }

    if (!newDataCube.getMeasure(value.pinnedSort)) value.pinnedSort = newDataCube.getDefaultSortMeasure();

    if (value.compare) {
      value.compare = value.compare.constrainToDimensions(newDataCube.dimensions, newDataCube.timeAttribute);
    }

    if (value.highlight) {
      value.highlight = value.highlight.constrainToDimensions(newDataCube.dimensions, newDataCube.timeAttribute);
    }

    return new Essence(value);
  }

  // Modification

  public changeFilter(filter: Filter, removeHighlight = false): Essence {
    var value = this.valueOf();
    value.filter = filter;

    if (removeHighlight) {
      value.highlight = null;
    }

    var differentAttributes = filter.getDifferentAttributes(this.filter);
    value.splits = value.splits.removeBucketingFrom(differentAttributes);
    return (new Essence(value)).updateSplitsWithFilter();
  }

  public changeTimezone(newTimezone: Timezone): Essence {
    var { timezone } = this;
    if (timezone === newTimezone) return this;
    var value = this.valueOf();
    value.timezone = newTimezone;
    return new Essence(value);
  }

  public changeTimeSelection(check: Expression): Essence {
    var { filter } = this;
    var timeAttribute = this.getTimeAttribute();
    return this.changeFilter(filter.setSelection(timeAttribute, check));
  }

  public convertToSpecificFilter(timekeeper: Timekeeper): Essence {
    var { dataCube, filter, timezone } = this;
    if (!filter.isRelative()) return this;
    return this.changeFilter(filter.getSpecificFilter(timekeeper.now(), dataCube.getMaxTime(timekeeper), timezone));
  }

  public changeSplits(splits: Splits, strategy: VisStrategy): Essence {
    var { visualizations, dataCube, visualization, visResolve, filter, colors } = this;

    splits = splits.updateWithFilter(filter, dataCube.dimensions);

    // If in manual mode stay there, keep the vis regardless of suggested strategy
    if (visResolve.isManual()) {
      strategy = VisStrategy.KeepAlways;
    }
    if (this.splits.length() > 0 && splits.length() !== 0) strategy = VisStrategy.UnfairGame;

    if (strategy !== VisStrategy.KeepAlways && strategy !== VisStrategy.UnfairGame) {
      var visAndResolve = Essence.getBestVisualization(visualizations, dataCube, splits, colors, (strategy === VisStrategy.FairGame ? null : visualization));
      visualization = visAndResolve.visualization;
    }

    var value = this.valueOf();
    value.splits = splits;
    value.visualization = visualization;
    if (value.highlight) {
      value.filter = value.highlight.applyToFilter(value.filter);
      value.highlight = null;
    }
    return new Essence(value);
  }

  public changeSplit(splitCombine: SplitCombine, strategy: VisStrategy): Essence {
    return this.changeSplits(Splits.fromSplitCombine(splitCombine), strategy);
  }

  public addSplit(split: SplitCombine, strategy: VisStrategy): Essence {
    var { splits } = this;
    return this.changeSplits(splits.addSplit(split), strategy);
  }

  public removeSplit(split: SplitCombine, strategy: VisStrategy): Essence {
    var { splits } = this;
    return this.changeSplits(splits.removeSplit(split), strategy);
  }

  public updateSplitsWithFilter(): Essence {
    var value = this.valueOf();
    var newSplits = value.splits.updateWithFilter(this.filter, this.dataCube.dimensions);
    if (value.splits === newSplits) return this;
    value.splits = newSplits;
    return new Essence(value);
  }

  public changeColors(colors: Colors): Essence {
    var value = this.valueOf();
    value.colors = colors;
    return new Essence(value);
  }

  public changeVisualization(visualization: Manifest): Essence {
    var value = this.valueOf();
    value.visualization = visualization;
    return new Essence(value);
  }

  public pin(dimension: Dimension): Essence {
    var value = this.valueOf();
    value.pinnedDimensions = value.pinnedDimensions.add(dimension.name);
    return new Essence(value);
  }

  public unpin(dimension: Dimension): Essence {
    var value = this.valueOf();
    value.pinnedDimensions = value.pinnedDimensions.remove(dimension.name);
    return new Essence(value);
  }

  public getPinnedSortMeasure(): Measure {
    return this.dataCube.getMeasure(this.pinnedSort);
  }

  public changePinnedSortMeasure(measure: Measure): Essence {
    var value = this.valueOf();
    value.pinnedSort = measure.name;
    return new Essence(value);
  }

  public toggleMultiMeasureMode(): Essence {
    const { dataCube, multiMeasureMode, selectedMeasures, singleMeasure } = this;
    var value = this.valueOf();
    value.multiMeasureMode = !multiMeasureMode;
    if (multiMeasureMode) {
      // Ensure that the singleMeasure is in the selectedMeasures
      if (selectedMeasures.size && !selectedMeasures.has(singleMeasure)) {
        value.singleMeasure = selectedMeasures.first();
      }
    } else {
      value.selectedMeasures = addToSetInOrder(dataCube.measures.map(m => m.name), value.selectedMeasures, singleMeasure);
    }
    return new Essence(value);
  }

  public changeSingleMeasure(measure: Measure): Essence {
    if (measure.name === this.singleMeasure) return this;
    var value = this.valueOf();
    value.singleMeasure = measure.name;
    value.splits = value.splits.changeSortIfOnMeasure(this.singleMeasure, measure.name);
    value.pinnedSort = measure.name;
    return new Essence(value);
  }

  public toggleSelectedMeasure(measure: Measure): Essence {
    var dataCube = this.dataCube;
    var value = this.valueOf();
    var selectedMeasures = value.selectedMeasures;
    var measureName = measure.name;

    if (selectedMeasures.has(measureName)) {
      value.selectedMeasures = selectedMeasures.delete(measureName);
    } else {
      value.selectedMeasures = addToSetInOrder(dataCube.measures.map(m => m.name), selectedMeasures, measureName);
    }

    return new Essence(value);
  }

  public toggleEffectiveMeasure(measure: Measure): Essence {
    if (this.getEffectiveMultiMeasureMode()) {
      return this.toggleSelectedMeasure(measure);
    } else {
      return this.changeSingleMeasure(measure);
    }
  }

  public acceptHighlight(): Essence {
    var { highlight } = this;
    if (!highlight) return this;
    return this.changeFilter(highlight.applyToFilter(this.filter), true);
  }

  public changeHighlight(owner: string, measure: string, delta: Filter): Essence {
    var { highlight } = this;

    // If there is already a highlight from someone else accept it
    var value: EssenceValue;
    if (highlight && highlight.owner !== owner) {
      value = this.changeFilter(highlight.applyToFilter(this.filter)).valueOf();
    } else {
      value = this.valueOf();
    }

    value.highlight = new Highlight({
      owner,
      delta,
      measure
    });
    return new Essence(value);
  }

  public dropHighlight(): Essence {
    var value = this.valueOf();
    value.highlight = null;
    return new Essence(value);
  }

}
check = Essence;
