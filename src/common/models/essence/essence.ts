'use strict';

import { List, OrderedSet } from 'immutable';
import { compressToBase64, decompressFromBase64 } from 'lz-string';
import { Class, Instance, isInstanceOf, arraysEqual } from 'immutable-class';
import { Timezone, Duration } from 'chronoshift';
import { $, Expression, RefExpression, ChainExpression, ExpressionJS, TimeRange, ApplyAction, SortAction } from 'plywood';
import { listsEqual } from '../../utils/general/general';
import { DataSource } from '../data-source/data-source';
import { Filter, FilterJS } from '../filter/filter';
import { Highlight, HighlightJS } from '../highlight/highlight';
import { Splits, SplitsJS } from '../splits/splits';
import { SplitCombine } from '../split-combine/split-combine';
import { Dimension } from '../dimension/dimension';
import { Measure } from '../measure/measure';
import { Manifest, Resolve } from '../manifest/manifest';

const HASH_VERSION = 1;

function constrainDimensions(dimensions: OrderedSet<string>, dataSource: DataSource): OrderedSet<string> {
  return <OrderedSet<string>>dimensions.filter((dimensionName) => Boolean(dataSource.getDimension(dimensionName)));
}

function constrainMeasures(measures: OrderedSet<string>, dataSource: DataSource): OrderedSet<string> {
  return <OrderedSet<string>>measures.filter((measureName) => Boolean(dataSource.getMeasure(measureName)));
}


export type DimensionOrMeasure = Dimension | Measure;

export interface VisualizationAndResolve {
  visualization: Manifest;
  resolve: Resolve;
}

export enum VisStrategy {
  FairGame,
  KeepIfReadyOrAutomatic,
  KeepIfReady,
  KeepAlways
}

export interface EssenceValue {
  dataSources?: List<DataSource>;
  visualizations?: List<Manifest>;

  dataSource: DataSource;
  visualization: Manifest;
  timezone: Timezone;
  filter: Filter;
  splits: Splits;
  selectedMeasures: OrderedSet<string>;
  pinnedDimensions: OrderedSet<string>;
  previewSort: string;
  pinnedSort: string;
  compare: Filter;
  highlight: Highlight;
}

export interface EssenceJS {
  dataSource: string;
  visualization: string;
  timezone: string;
  filter: FilterJS;
  splits: SplitsJS;
  selectedMeasures: string[];
  pinnedDimensions: string[];
  previewSort?: string;
  pinnedSort?: string;
  compare?: FilterJS;
  highlight?: HighlightJS;
}

var check: Class<EssenceValue, EssenceJS>;
export class Essence implements Instance<EssenceValue, EssenceJS> {
  static isEssence(candidate: any): boolean {
    return isInstanceOf(candidate, Essence);
  }

  static getBaseURL(): string {
    var url = window.location;
    return url.origin + url.pathname;
  }

  static fromHash(hash: string, dataSources: List<DataSource>, visualizations: List<Manifest>): Essence {
    // trim a potential leading #
    if (hash[0] === '#') hash = hash.substr(1);

    var parts = hash.split('/');
    if (parts.length < 4) return null;
    var dataSource = parts.shift();
    var visualization = parts.shift();
    var version = parseInt(parts.shift(), 10);

    if (version !== 1) return null;

    var jsArray: any[] = null;
    try {
      jsArray = JSON.parse('[' + decompressFromBase64(parts.join('/')) + ']');
    } catch (e) {
      return null;
    }


    if (!Array.isArray(jsArray)) return null;
    var jsArrayLength = jsArray.length;
    if (!(7 <= jsArrayLength && jsArrayLength <= 9)) return null;

    var essence: Essence;
    try {
      essence = Essence.fromJS({
        dataSource: dataSource,
        visualization: visualization,
        timezone: jsArray[0],
        filter: jsArray[1],
        splits: jsArray[2],
        selectedMeasures: jsArray[3],
        pinnedDimensions: jsArray[4],
        previewSort: jsArray[5],
        pinnedSort: jsArray[6],
        compare: jsArray[7] || null,
        highlight: jsArray[8] || null
      }, dataSources, visualizations);
    } catch (e) {
      return null;
    }

    return essence;
  }

  static fromDataSource(dataSource: DataSource, dataSources: List<DataSource>, visualizations: List<Manifest>): Essence {
    var filter: Filter;
    if (dataSource.timeAttribute) {
      var now = dataSource.getMaxTime();
      var timeRange = TimeRange.fromJS({
        start: dataSource.defaultDuration.move(now, Timezone.UTC, -1),
        end: now
      });
      filter = Filter.fromClause(dataSource.timeAttribute.in(timeRange));
    } else {
      filter = Filter.EMPTY;
    }

    return new Essence({
      dataSources: dataSources,
      visualizations: visualizations,

      dataSource: dataSource,
      visualization: null,
      timezone: Timezone.UTC,
      filter,
      splits: Splits.EMPTY,
      selectedMeasures: OrderedSet(dataSource.measures.toArray().slice(0, 6).map(m => m.name)),
      pinnedDimensions: dataSource.defaultPinnedDimensions,
      previewSort: dataSource.defaultSortMeasure,
      pinnedSort: dataSource.defaultSortMeasure,
      compare: null,
      highlight: null
    });
  }

  static fromJS(parameters: EssenceJS, dataSources?: List<DataSource>, visualizations?: List<Manifest>): Essence {
    var dataSourceName = parameters.dataSource;
    var visualizationID = parameters.visualization;
    var visualization = visualizations.find(v => v.id === visualizationID);

    var dataSource = dataSources.find((ds) => ds.name === dataSourceName);
    var timezone = Timezone.fromJS(parameters.timezone);
    var filter = Filter.fromJS(parameters.filter).constrainToDataSource(dataSource);
    var splits = Splits.fromJS(parameters.splits).constrainToDataSource(dataSource);
    var selectedMeasures = constrainMeasures(OrderedSet(parameters.selectedMeasures), dataSource);
    var pinnedDimensions = constrainDimensions(OrderedSet(parameters.pinnedDimensions), dataSource);

    var defaultSortMeasureName = dataSource.defaultSortMeasure;

    var previewSort = parameters.previewSort || defaultSortMeasureName;
    if (!dataSource.getMeasure(previewSort)) previewSort = defaultSortMeasureName;

    var pinnedSort = parameters.pinnedSort || defaultSortMeasureName;
    if (!dataSource.getMeasure(pinnedSort)) pinnedSort = defaultSortMeasureName;

    var compare: Filter = null;
    var compareJS = parameters.compare;
    if (compareJS) {
      compare = Filter.fromJS(compareJS).constrainToDataSource(dataSource);
    }

    var highlight: Highlight = null;
    var highlightJS = parameters.highlight;
    if (highlightJS) {
      highlight = Highlight.fromJS(highlightJS).constrainToDataSource(dataSource);
    }

    return new Essence({
      dataSources,
      visualizations,

      dataSource,
      visualization,
      timezone,
      filter,
      splits,
      selectedMeasures,
      pinnedDimensions,
      previewSort,
      pinnedSort,
      compare,
      highlight
    });
  }


  public dataSources: List<DataSource>;
  public visualizations: List<Manifest>;

  public dataSource: DataSource;
  public visualization: Manifest;
  public timezone: Timezone;
  public filter: Filter;
  public splits: Splits;
  public selectedMeasures: OrderedSet<string>;
  public pinnedDimensions: OrderedSet<string>;
  public previewSort: string;
  public pinnedSort: string;
  public compare: Filter;
  public highlight: Highlight;

  public visResolve: Resolve;

  constructor(parameters: EssenceValue) {
    this.dataSources = parameters.dataSources;
    if (!this.dataSources.size) throw new Error('can not have empty dataSource list');
    this.visualizations = parameters.visualizations;

    this.dataSource = parameters.dataSource;
    if (!this.dataSource) throw new Error('must have a dataSource');

    this.timezone = parameters.timezone;
    this.filter = parameters.filter;
    this.splits = parameters.splits;
    this.selectedMeasures = parameters.selectedMeasures;
    this.pinnedDimensions = parameters.pinnedDimensions;
    this.previewSort = parameters.previewSort;
    this.pinnedSort = parameters.pinnedSort;
    this.compare = parameters.compare;
    this.highlight = parameters.highlight;

    // Place vis here because it needs to know about splits (and maybe later other things)
    var visualization = parameters.visualization;
    if (!visualization) {
      var visAndResolve = this.getBestVisualization(this.splits);
      visualization = visAndResolve.visualization;
    }
    this.visualization = visualization;

    var visResolve = visualization.handleCircumstance(this.dataSource, this.splits);
    if (visResolve.isAutomatic()) {
      this.splits = visResolve.adjustment;
      visResolve = visualization.handleCircumstance(this.dataSource, this.splits);
      if (!visResolve.isReady()) throw new Error('visualization must be ready after automatic adjustment');
    }
    this.visResolve = visResolve;
  }

  public valueOf(): EssenceValue {
    return {
      dataSources: this.dataSources,
      visualizations: this.visualizations,

      dataSource: this.dataSource,
      visualization: this.visualization,
      timezone: this.timezone,
      filter: this.filter,
      splits: this.splits,
      selectedMeasures: this.selectedMeasures,
      pinnedDimensions: this.pinnedDimensions,
      previewSort: this.previewSort,
      pinnedSort: this.pinnedSort,
      compare: this.compare,
      highlight: this.highlight
    };
  }

  public toJS(): EssenceJS {
    var selectedMeasures = this.selectedMeasures.toArray();
    var pinnedDimensions = this.pinnedDimensions.toArray();
    var js: EssenceJS = {
      dataSource: this.dataSource.name,
      visualization: this.visualization.id,
      timezone: this.timezone.toJS(),
      filter: this.filter.toJS(),
      splits: this.splits.toJS(),
      selectedMeasures,
      pinnedDimensions
    };
    var defaultSortMeasure = this.dataSource.defaultSortMeasure;
    if (js.previewSort !== defaultSortMeasure) js.previewSort = this.previewSort;
    if (js.pinnedSort !== defaultSortMeasure) js.pinnedSort = this.pinnedSort;
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
      this.dataSource.equals(other.dataSource) &&
      this.visualization.id === other.visualization.id &&
      this.timezone.equals(other.timezone) &&
      this.filter.equals(other.filter) &&
      this.splits.equals(other.splits) &&
      this.selectedMeasures.equals(other.selectedMeasures) &&
      this.pinnedDimensions.equals(other.pinnedDimensions) &&
      this.previewSort === other.previewSort &&
      this.pinnedSort === other.pinnedSort &&
      Boolean(this.compare) === Boolean(other.compare) &&
      (!this.compare || this.compare.equals(other.compare)) &&
      Boolean(this.highlight) === Boolean(other.highlight) &&
      (!this.highlight || this.highlight.equals(other.highlight));
  }

  public toHash(): string {
    var js: any = this.toJS();
    var compressed: any[] = [
      js.timezone,         // 0
      js.filter,           // 1
      js.splits,           // 2
      js.selectedMeasures, // 3
      js.pinnedDimensions, // 4
      js.previewSort,      // 5
      js.pinnedSort        // 6
    ];
    if (js.compare)     compressed[7] = js.compare;
    if (js.highlight)   compressed[8] = js.highlight;

    var restJSON: string[] = [];
    for (var i = 0; i < compressed.length; i++) {
      restJSON.push(JSON.stringify(compressed[i] || null));
    }

    return '#' + [
      js.dataSource,
      js.visualization,
      HASH_VERSION,
      compressToBase64(restJSON.join(','))
    ].join('/');
  }

  public getURL(): string {
    return Essence.getBaseURL() + this.toHash();
  }

  public getBestVisualization(splits: Splits): VisualizationAndResolve {
    var { visualizations, dataSource } = this;
    var visAndResolves = visualizations.toArray().map((visualization) => {
      return {
        visualization,
        resolve: visualization.handleCircumstance(dataSource, splits)
      };
    });

    // the vis are sorted least impressive -> most impressive so reverse the list
    visAndResolves.reverse();

    // Try to find a ready vis
    for (var visAndResolve of visAndResolves) {
      if (visAndResolve.resolve.isReady()) return visAndResolve;
    }

    // Try to find an automatic vis
    for (var visAndResolve of visAndResolves) {
      if (visAndResolve.resolve.isAutomatic()) return visAndResolve;
    }

    // Should never get here because totals / table should always be able to be applied
    throw new Error('could not find ready or automatic vis, something is misconstrued');
  }

  public getTimeAttribute(): RefExpression {
    return this.dataSource.timeAttribute;
  }

  public getTimeDimension(): Dimension {
    return this.dataSource.getTimeDimension();
  }

  public getEffectiveFilter(highlightId: string = null, unfilterDimension: Dimension = null): Filter {
    var { filter, highlight } = this;
    if (highlight && (highlightId !== highlight.owner)) filter = highlight.applyToFilter(filter);
    if (unfilterDimension) filter = filter.remove(unfilterDimension.expression);
    return filter;
  }

  public getMeasures(): List<Measure> {
    var dataSource = this.dataSource;
    return <List<Measure>>this.selectedMeasures.toList().map(measureName => dataSource.getMeasure(measureName));
  }

  public differentDataSource(other: Essence): boolean {
    return this.dataSource !== other.dataSource;
  }

  public differentTimezone(other: Essence): boolean {
    return !this.timezone.equals(other.timezone);
  }

  public differentFilter(other: Essence): boolean {
    return !this.filter.equals(other.filter);
  }

  public differentSplits(other: Essence): boolean {
    return !this.splits.equals(other.splits);
  }

  public differentSelectedMeasures(other: Essence): boolean {
    return !this.selectedMeasures.equals(other.selectedMeasures);
  }

  public newSelectedMeasures(other: Essence): boolean {
    return !this.selectedMeasures.isSubset(other.selectedMeasures);
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

  public differentEffectiveFilter(other: Essence, highlightId: string = null, unfilterDimension: Dimension = null): boolean {
    var myEffectiveFilter = this.getEffectiveFilter(highlightId, unfilterDimension);
    var otherEffectiveFilter = other.getEffectiveFilter(highlightId, unfilterDimension);
    return !myEffectiveFilter.equals(otherEffectiveFilter);
  }

  public highlightOn(owner: string): boolean {
    var { highlight } = this;
    if (!highlight) return false;
    return highlight.owner === owner;
  }

  public getSingleHighlightValue(): any {
    var { highlight } = this;
    if (!highlight) return null;
    return highlight.delta.getSingleValue();
  }

  public getApplyForSort(sort: SortAction): ApplyAction {
    var sortOn = (<RefExpression>sort.expression).name;
    var sortMeasure = this.dataSource.getMeasure(sortOn);
    if (!sortMeasure) return null;
    return sortMeasure.toApplyAction();
  }

  public getCommonSort(): SortAction {
    var splits = this.splits.toArray();
    var commonSort: SortAction = null;
    for (var split of splits) {
      var sort = split.sortAction;
      if (commonSort) {
        if (!commonSort.equals(sort)) return null;
      } else {
        commonSort = sort;
      }
    }
    return commonSort;
  }

  // Modification

  public changeDataSource(dataSource: DataSource): Essence {
    var { dataSources, visualizations } = this;
    var dataSourceName = dataSource.name;
    var existingDataSource = dataSources.find((ds) => ds.name === dataSourceName);
    if (!existingDataSource) throw new Error(`unknown DataSource changed: ${dataSourceName}`);

    if (existingDataSource.equals(dataSource)) {
      // Just changing DataSource, nothing to see here.
      return Essence.fromDataSource(dataSource, dataSources, visualizations);
    }

    // We are actually updating info within the named dataSource
    if (this.dataSource.name !== dataSource.name) throw new Error('can not change non-selected dataSource');

    var value = this.valueOf();
    value.dataSource = dataSource;
    value.dataSources = <List<DataSource>>dataSources.map((ds) => ds.name === dataSourceName ? dataSource : ds);

    // Make sure that all the elements of state are still valid
    var oldDataSource = this.dataSource;
    value.filter = value.filter.constrainToDataSource(dataSource, oldDataSource);
    value.splits = value.splits.constrainToDataSource(dataSource);
    value.selectedMeasures = constrainMeasures(value.selectedMeasures, dataSource);
    value.pinnedDimensions = constrainDimensions(value.pinnedDimensions, dataSource);

    var defaultSortMeasureName = dataSource.defaultSortMeasure;
    if (!dataSource.getMeasure(value.previewSort)) value.previewSort = defaultSortMeasureName;
    if (!dataSource.getMeasure(value.pinnedSort)) value.pinnedSort = defaultSortMeasureName;

    if (value.compare) {
      value.compare = value.compare.constrainToDataSource(dataSource);
    }

    if (value.highlight) {
      value.highlight = value.highlight.constrainToDataSource(dataSource);
    }

    return new Essence(value);
  }

  public changeFilter(filter: Filter, removeHighlight: boolean = false): Essence {
    var value = this.valueOf();
    value.filter = filter;

    if (removeHighlight) {
      value.highlight = null;
    }

    var timeAttribute = this.getTimeAttribute();
    var oldTimeRange = timeAttribute ? this.filter.getTimeRange(timeAttribute) : null;
    var newTimeRange = timeAttribute ? filter.getTimeRange(timeAttribute) : null;
    if (newTimeRange && !newTimeRange.equals(oldTimeRange)) {
      value.splits = value.splits.updateWithTimeRange(timeAttribute, newTimeRange, true);
    }

    return new Essence(value);
  }

  public changeTimeRange(timeRange: TimeRange): Essence {
    var { filter } = this;
    var timeAttribute = this.getTimeAttribute();
    return this.changeFilter(filter.setTimeRange(timeAttribute, timeRange));
  }

  public changeSplits(splits: Splits, strategy: VisStrategy): Essence {
    var { dataSource, visualization, visResolve, filter } = this;

    var timeAttribute = this.getTimeAttribute();
    if (timeAttribute) {
      splits = splits.updateWithTimeRange(timeAttribute, filter.getTimeRange(timeAttribute));
    }

    // If in manual mode stay there, keep the vis regardless of suggested strategy
    if (visResolve.isManual()) {
      strategy = VisStrategy.KeepAlways;
    }

    //console.log('VisStrategy:', VisStrategy[strategy]);

    var keepVis: boolean;
    switch (strategy) {
      case VisStrategy.FairGame:
        keepVis = false;
        break;

      case VisStrategy.KeepIfReadyOrAutomatic:
        var newResolve = visualization.handleCircumstance(dataSource, splits);
        keepVis = newResolve.isReady() || newResolve.isAutomatic();
        break;

      case VisStrategy.KeepIfReady:
        var newResolve = visualization.handleCircumstance(dataSource, splits);
        keepVis = newResolve.isReady();
        break;

      case VisStrategy.KeepAlways:
        keepVis = true;
        break;

      default:
        throw new Error('unknown vis strategy');
    }

    if (!keepVis) {
      var visAndResolve = this.getBestVisualization(splits);
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

  public getPreviewSortMeasure(): Measure {
    return this.dataSource.getMeasure(this.previewSort);
  }

  public getPinnedSortMeasure(): Measure {
    return this.dataSource.getMeasure(this.pinnedSort);
  }

  public changePinnedSortMeasure(measure: Measure): Essence {
    var value = this.valueOf();
    value.pinnedSort = measure.name;
    return new Essence(value);
  }

  public toggleMeasure(measure: Measure): Essence {
    var dataSource = this.dataSource;
    var value = this.valueOf();
    var selectedMeasures = value.selectedMeasures;
    var measureName = measure.name;

    if (selectedMeasures.has(measureName)) {
      value.selectedMeasures = selectedMeasures.delete(measureName);
    } else {
      // Preserve the order of the measures in the datasource
      value.selectedMeasures = OrderedSet(
        dataSource.measures
          .toArray()
          .map(m => m.name)
          .filter((name) => selectedMeasures.has(name) || name === measureName)
      );
    }

    return new Essence(value);
  }

  public acceptHighlight(): Essence {
    var { highlight } = this;
    if (!highlight) return this;
    return this.changeFilter(highlight.applyToFilter(this.filter), true);
  }

  public changeHighlight(owner: string, delta: Filter): Essence {
    var { highlight } = this;

    // If there is already a highlight from someone else accept it
    var value: EssenceValue;
    if (highlight && highlight.owner !== owner) {
      value = this.changeFilter(highlight.applyToFilter(this.filter));
    } else {
      value = this.valueOf();
    }

    value.highlight = new Highlight({
      owner,
      delta
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
