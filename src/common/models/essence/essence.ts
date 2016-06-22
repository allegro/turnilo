import { List, OrderedSet, Iterable } from 'immutable';
import { compressToBase64, decompressFromBase64 } from 'lz-string';
import { Class, Instance, isInstanceOf, immutableEqual } from 'immutable-class';
import { Timezone, Duration, minute } from 'chronoshift';
import { $, Expression, RefExpression, TimeRange, ApplyAction, SortAction, Set, helper } from 'plywood';
import { hasOwnProperty } from '../../../common/utils/general/general';
import { DataSource } from '../data-source/data-source';
import { Filter, FilterJS } from '../filter/filter';
import { FilterClause } from '../filter-clause/filter-clause';
import { Highlight, HighlightJS } from '../highlight/highlight';
import { Splits, SplitsJS } from '../splits/splits';
import { SplitCombine } from '../split-combine/split-combine';
import { Dimension } from '../dimension/dimension';
import { Measure } from '../measure/measure';
import { Colors, ColorsJS } from '../colors/colors';
import { Manifest, Resolve } from '../manifest/manifest';

const HASH_VERSION = 2;

function constrainDimensions(dimensions: OrderedSet<string>, dataSource: DataSource): OrderedSet<string> {
  return <OrderedSet<string>>dimensions.filter((dimensionName) => Boolean(dataSource.getDimension(dimensionName)));
}

function constrainMeasures(measures: OrderedSet<string>, dataSource: DataSource): OrderedSet<string> {
  return <OrderedSet<string>>measures.filter((measureName) => Boolean(dataSource.getMeasure(measureName)));
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
  dataSource?: DataSource;

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
  dataSource: DataSource;
  visualizations: Manifest[];
}

var check: Class<EssenceValue, EssenceJS>;
export class Essence implements Instance<EssenceValue, EssenceJS> {
  static isEssence(candidate: any): candidate is Essence {
    return isInstanceOf(candidate, Essence);
  }

  static getBestVisualization(visualizations: Manifest[], dataSource: DataSource, splits: Splits, colors: Colors, currentVisualization: Manifest): VisualizationAndResolve {
    var visAndResolves = visualizations.map((visualization) => {
      return {
        visualization,
        resolve: visualization.handleCircumstance(dataSource, splits, colors, visualization === currentVisualization)
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

  static fromDataSource(dataSource: DataSource, context: EssenceContext): Essence {
    var timezone = dataSource.defaultTimezone;

    var splits = Splits.EMPTY;
    var { defaultSplits } = dataSource.options;
    if (defaultSplits) {
      splits = Splits.fromJS(defaultSplits, dataSource);
    }

    var essence = new Essence({
      dataSource: context.dataSource,
      visualizations: context.visualizations,

      visualization: null,
      timezone,
      filter: null,
      splits,
      multiMeasureMode: false,
      singleMeasure: dataSource.defaultSortMeasure,
      selectedMeasures: dataSource.defaultSelectedMeasures || OrderedSet(dataSource.measures.toArray().slice(0, 4).map(m => m.name)),
      pinnedDimensions: dataSource.defaultPinnedDimensions || OrderedSet([]),
      colors: null,
      pinnedSort: dataSource.defaultSortMeasure,
      compare: null,
      highlight: null
    });

    if (defaultSplits) {
      essence = essence.updateSplitsWithFilter();
    }

    return essence;
  }

  static fromJS(parameters: EssenceJS, context?: EssenceContext): Essence {
    if (!context) throw new Error('must have context');
    const { dataSource, visualizations } = context;

    var visualizationID = parameters.visualization;
    if (visualizationID === 'time-series') visualizationID = 'line-chart'; // Back compat (used to be named time-series)
    var visualization = helper.find(visualizations, v => v.id === visualizationID);

    var timezone = parameters.timezone ? Timezone.fromJS(parameters.timezone) : null;
    var filter = parameters.filter ? Filter.fromJS(parameters.filter).constrainToDimensions(dataSource.dimensions, dataSource.timeAttribute) : null;
    var splits = Splits.fromJS(parameters.splits || [], dataSource).constrainToDimensions(dataSource.dimensions);

    var defaultSortMeasureName = dataSource.defaultSortMeasure;

    var multiMeasureMode = hasOwnProperty(parameters, 'multiMeasureMode') ? parameters.multiMeasureMode : !hasOwnProperty(parameters, 'singleMeasure');
    var singleMeasure = dataSource.getMeasure(parameters.singleMeasure) ? parameters.singleMeasure : defaultSortMeasureName;

    var selectedMeasures = constrainMeasures(OrderedSet(parameters.selectedMeasures || []), dataSource);
    var pinnedDimensions = constrainDimensions(OrderedSet(parameters.pinnedDimensions || []), dataSource);

    var colors = parameters.colors ? Colors.fromJS(parameters.colors) : null;

    var pinnedSort = dataSource.getMeasure(parameters.pinnedSort) ? parameters.pinnedSort : defaultSortMeasureName;

    var compare: Filter = null;
    var compareJS = parameters.compare;
    if (compareJS) {
      compare = Filter.fromJS(compareJS).constrainToDimensions(dataSource.dimensions, dataSource.timeAttribute);
    }

    var highlight: Highlight = null;
    var highlightJS = parameters.highlight;
    if (highlightJS) {
      highlight = Highlight.fromJS(highlightJS).constrainToDimensions(dataSource.dimensions, dataSource.timeAttribute);
    }

    return new Essence({
      dataSource,
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


  public dataSource: DataSource;
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
      dataSource,
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

    if (!dataSource) throw new Error('Essence must have a dataSource');

    timezone = timezone || Timezone.UTC;

    if (!filter) {
      if (dataSource.timeAttribute) {
        filter = dataSource.defaultFilter.setSelection(
          dataSource.timeAttribute,
          $(FilterClause.MAX_TIME_REF_NAME).timeRange(dataSource.defaultDuration, -1)
        );
      } else {
        filter = Filter.EMPTY;
      }
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
        var visAndResolve = Essence.getBestVisualization(visualizations, dataSource, splits, colors, null);
        visualization = visAndResolve.visualization;
      }

      var visResolve = visualization.handleCircumstance(dataSource, splits, colors, true);
      if (visResolve.isAutomatic()) {
        var adjustment = visResolve.adjustment;
        splits = adjustment.splits;
        colors = adjustment.colors || null;
        visResolve = visualization.handleCircumstance(dataSource, splits, colors, true);

        if (!visResolve.isReady()) {
          console.log(visResolve);
          throw new Error(visualization.title + ' must be ready after automatic adjustment');
        }
      }
    }

    this.visualizations = visualizations;
    this.dataSource = dataSource;
    this.visualization = visualization;
    this.dataSource = dataSource;
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
      dataSource: this.dataSource,
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
      visualization: this.visualization.id,
      timezone: this.timezone.toJS(),
      filter: this.filter.toJS(),
      splits: this.splits.toJS(),
      singleMeasure: this.singleMeasure,
      selectedMeasures: this.selectedMeasures.toArray(),
      pinnedDimensions: this.pinnedDimensions.toArray()
    };
    if (this.multiMeasureMode) js.multiMeasureMode = true;
    if (this.colors) js.colors = this.colors.toJS();
    var defaultSortMeasure = this.dataSource.defaultSortMeasure;
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
      this.dataSource.equals(other.dataSource) &&
      this.visualization.id === other.visualization.id &&
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
    return this.dataSource.timeAttribute;
  }

  public getTimeDimension(): Dimension {
    return this.dataSource.getTimeDimension();
  }

  public evaluateSelection(selection: Expression, now: Date = new Date()): TimeRange {
    var { dataSource, timezone } = this;
    var maxTime = dataSource.getMaxTimeDate();
    return FilterClause.evaluate(selection, now, maxTime, timezone);
  }

  public evaluateClause(clause: FilterClause, now: Date = new Date()): FilterClause {
    var { dataSource, timezone } = this;
    var maxTime = dataSource.getMaxTimeDate();
    return clause.evaluate(now, maxTime, timezone);
  }

  public getEffectiveFilter(highlightId: string = null, unfilterDimension: Dimension = null): Filter {
    var { dataSource, filter, highlight, timezone } = this;
    if (highlight && (highlightId !== highlight.owner)) filter = highlight.applyToFilter(filter);
    if (unfilterDimension) filter = filter.remove(unfilterDimension.expression);

    var maxTime = dataSource.getMaxTimeDate();
    return filter.getSpecificFilter(new Date(), maxTime, timezone);
  }

  public getTimeSelection(): Expression {
    const timeAttribute = this.getTimeAttribute();
    return this.filter.getSelection(timeAttribute);
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
      return List([this.dataSource.getMeasure(this.singleMeasure)]);
    }
  }

  public getMeasures(): List<Measure> {
    var dataSource = this.dataSource;
    return <List<Measure>>this.selectedMeasures.toList().map(measureName => dataSource.getMeasure(measureName));
  }

  public getEffectiveSelectedMeasure(): OrderedSet<string> {
    if (this.getEffectiveMultiMeasureMode()) {
      return this.selectedMeasures;
    } else {
      return OrderedSet([this.singleMeasure]);
    }
  }

  public differentDataSource(other: Essence): boolean {
    return this.dataSource !== other.dataSource;
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

  public differentEffectiveFilter(other: Essence, highlightId: string = null, unfilterDimension: Dimension = null): boolean {
    var myEffectiveFilter = this.getEffectiveFilter(highlightId, unfilterDimension);
    var otherEffectiveFilter = other.getEffectiveFilter(highlightId, unfilterDimension);
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

  public updateDataSource(newDataSource: DataSource): Essence {
    var { dataSource, visualizations } = this;

    if (dataSource.equals(newDataSource)) return this; // nothing to do
    if (dataSource.equalsWithoutMaxTime(newDataSource)) { // Updated maxTime
      var value = this.valueOf();
      value.dataSource = newDataSource;
      return new Essence(value);
    }

    if (dataSource.name !== newDataSource.name) return Essence.fromDataSource(newDataSource, {
      dataSource: newDataSource,
      visualizations
    });

    var value = this.valueOf();
    value.dataSource = newDataSource;

    // Make sure that all the elements of state are still valid
    value.filter = value.filter.constrainToDimensions(newDataSource.dimensions, newDataSource.timeAttribute, dataSource.timeAttribute);
    value.splits = value.splits.constrainToDimensions(newDataSource.dimensions);
    value.selectedMeasures = constrainMeasures(value.selectedMeasures, newDataSource);
    value.pinnedDimensions = constrainDimensions(value.pinnedDimensions, newDataSource);

    if (value.colors && !newDataSource.getDimension(value.colors.dimension)) {
      value.colors = null;
    }

    var defaultSortMeasureName = newDataSource.defaultSortMeasure;
    if (!newDataSource.getMeasure(value.pinnedSort)) value.pinnedSort = defaultSortMeasureName;

    if (value.compare) {
      value.compare = value.compare.constrainToDimensions(newDataSource.dimensions, newDataSource.timeAttribute);
    }

    if (value.highlight) {
      value.highlight = value.highlight.constrainToDimensions(newDataSource.dimensions, newDataSource.timeAttribute);
    }

    return new Essence(value);
  }

  public attachVisualizations(visualizations: Manifest[]): Essence {
    var value = this.valueOf();
    value.visualizations = visualizations;
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

  public convertToSpecificFilter(): Essence {
    var { dataSource, filter, timezone } = this;
    if (!filter.isRelative()) return this;
    var maxTime = dataSource.getMaxTimeDate();
    return this.changeFilter(filter.getSpecificFilter(new Date(), maxTime, timezone));
  }

  public changeSplits(splits: Splits, strategy: VisStrategy): Essence {
    var { visualizations, dataSource, visualization, visResolve, colors } = this;

    splits = splits.updateWithFilter(this.getEffectiveFilter(), dataSource.dimensions);

    // If in manual mode stay there, keep the vis regardless of suggested strategy
    if (visResolve.isManual()) {
      strategy = VisStrategy.KeepAlways;
    }

    if (strategy !== VisStrategy.KeepAlways) {
      var visAndResolve = Essence.getBestVisualization(visualizations, dataSource, splits, colors, (strategy === VisStrategy.FairGame ? null : visualization));
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
    value.splits = value.splits.updateWithFilter(this.getEffectiveFilter(), this.dataSource.dimensions);
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
    return this.dataSource.getMeasure(this.pinnedSort);
  }

  public changePinnedSortMeasure(measure: Measure): Essence {
    var value = this.valueOf();
    value.pinnedSort = measure.name;
    return new Essence(value);
  }

  public toggleMultiMeasureMode(): Essence {
    const { dataSource, multiMeasureMode, selectedMeasures, singleMeasure } = this;
    var value = this.valueOf();
    value.multiMeasureMode = !multiMeasureMode;
    if (multiMeasureMode) {
      // Ensure that the singleMeasure is in the selectedMeasures
      if (selectedMeasures.size && !selectedMeasures.has(singleMeasure)) {
        value.singleMeasure = selectedMeasures.first();
      }
    } else {
      value.selectedMeasures = addToSetInOrder(dataSource.measures.map(m => m.name), value.selectedMeasures, singleMeasure);
    }
    return new Essence(value);
  }

  public changeSingleMeasure(measure: Measure): Essence {
    if (measure.name === this.singleMeasure) return this;
    var value = this.valueOf();
    value.singleMeasure = measure.name;
    value.pinnedSort = measure.name;
    return new Essence(value);
  }

  public toggleSelectedMeasure(measure: Measure): Essence {
    var dataSource = this.dataSource;
    var value = this.valueOf();
    var selectedMeasures = value.selectedMeasures;
    var measureName = measure.name;

    if (selectedMeasures.has(measureName)) {
      value.selectedMeasures = selectedMeasures.delete(measureName);
    } else {
      value.selectedMeasures = addToSetInOrder(dataSource.measures.map(m => m.name), selectedMeasures, measureName);
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
