import { List, OrderedSet } from 'immutable';
import { compressToBase64, decompressFromBase64 } from 'lz-string';
import { Class, Instance, isInstanceOf, arraysEqual } from 'immutable-class';
import { Timezone, Duration, minute } from 'chronoshift';
import { $, Expression, RefExpression, ChainExpression, ExpressionJS, TimeRange, ApplyAction, SortAction, Set } from 'plywood';
import { listsEqual } from '../../utils/general/general';
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
const HASH_VERSION = 1;

function constrainDimensions(dimensions: OrderedSet<string>, dataSource: DataSource): OrderedSet<string> {
  return <OrderedSet<string>>dimensions.filter((dimensionName) => Boolean(dataSource.getDimension(dimensionName)));
}

function constrainMeasures(measures: OrderedSet<string>, dataSource: DataSource): OrderedSet<string> {
  return <OrderedSet<string>>measures.filter((measureName) => Boolean(dataSource.getMeasure(measureName)));
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
  visualizations?: List<Manifest>;
  dataSource?: DataSource;

  visualization: Manifest;
  timezone: Timezone;
  filter: Filter;
  splits: Splits;
  selectedMeasures: OrderedSet<string>;
  pinnedDimensions: OrderedSet<string>;
  colors: Colors;
  pinnedSort: string;
  compare: Filter;
  highlight: Highlight;
}

export interface EssenceJS {
  visualization: string;
  timezone: string;
  filter: FilterJS;
  splits: SplitsJS;
  selectedMeasures: string[];
  pinnedDimensions: string[];
  colors?: ColorsJS;
  pinnedSort?: string;
  compare?: FilterJS;
  highlight?: HighlightJS;
}

export interface EssenceContext {
  dataSource: DataSource;
  visualizations: List<Manifest>;
}

var check: Class<EssenceValue, EssenceJS>;
export class Essence implements Instance<EssenceValue, EssenceJS> {
  static isEssence(candidate: any): boolean {
    return isInstanceOf(candidate, Essence);
  }

  static fromHash(hash: string, context: EssenceContext): Essence {
    var parts = hash.split('/');
    if (parts.length < 3) return null;
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
    if (!(6 <= jsArrayLength && jsArrayLength <= 9)) return null;

    var essence: Essence;
    try {
      essence = Essence.fromJS({
        visualization: visualization,
        timezone: jsArray[0],
        filter: jsArray[1],
        splits: jsArray[2],
        selectedMeasures: jsArray[3],
        pinnedDimensions: jsArray[4],
        pinnedSort: jsArray[5],
        colors: jsArray[6] || null,
        compare: jsArray[7] || null,
        highlight: jsArray[8] || null
      }, context);
    } catch (e) {
      return null;
    }

    return essence;
  }

  static fromDataSource(dataSource: DataSource, context: EssenceContext): Essence {
    var timezone = dataSource.defaultTimezone;

    var filter = dataSource.defaultFilter;
    if (dataSource.timeAttribute) {
      filter = filter.setSelection(
        dataSource.timeAttribute,
        $(FilterClause.MAX_TIME_REF_NAME).timeRange(dataSource.defaultDuration, -1)
      );
    }

    var splits = Splits.EMPTY;
    if (typeof dataSource.options['defaultSplitDimension'] === 'string') {
      var defaultSplitDimension = dataSource.getDimension(dataSource.options['defaultSplitDimension']);
      if (defaultSplitDimension) {
        splits = Splits.fromSplitCombine(SplitCombine.fromExpression(defaultSplitDimension.expression));
      }
      var timeAttribute = dataSource.timeAttribute;
      if (timeAttribute) {
        var now = new Date();
        var maxTime = dataSource.getMaxTimeDate();
        splits = splits.updateWithTimeRange(timeAttribute, FilterClause.evaluate(filter.getSelection(timeAttribute), now, maxTime, timezone), timezone);
      }
    }

    return new Essence({
      dataSource: context.dataSource,
      visualizations: context.visualizations,

      visualization: null,
      timezone,
      filter,
      splits,
      selectedMeasures: OrderedSet(dataSource.measures.toArray().slice(0, 4).map(m => m.name)),
      pinnedDimensions: dataSource.defaultPinnedDimensions,
      colors: null,
      pinnedSort: dataSource.defaultSortMeasure,
      compare: null,
      highlight: null
    });
  }

  static fromJS(parameters: EssenceJS, context?: EssenceContext): Essence {
    if (!context) throw new Error('must have context');
    const { dataSource, visualizations } = context;

    var visualizationID = parameters.visualization;
    var visualization = visualizations.find(v => v.id === visualizationID);

    var timezone = Timezone.fromJS(parameters.timezone);
    var filter = Filter.fromJS(parameters.filter).constrainToDimensions(dataSource.dimensions, dataSource.timeAttribute);
    var splits = Splits.fromJS(parameters.splits).constrainToDimensions(dataSource.dimensions);
    var selectedMeasures = constrainMeasures(OrderedSet(parameters.selectedMeasures), dataSource);
    var pinnedDimensions = constrainDimensions(OrderedSet(parameters.pinnedDimensions), dataSource);

    var defaultSortMeasureName = dataSource.defaultSortMeasure;

    var colors = parameters.colors ? Colors.fromJS(parameters.colors) : null;

    var pinnedSort = parameters.pinnedSort || defaultSortMeasureName;
    if (!dataSource.getMeasure(pinnedSort)) pinnedSort = defaultSortMeasureName;

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
      selectedMeasures,
      pinnedDimensions,
      colors,
      pinnedSort,
      compare,
      highlight
    });
  }


  public dataSource: DataSource;
  public visualizations: List<Manifest>;

  public visualization: Manifest;
  public timezone: Timezone;
  public filter: Filter;
  public splits: Splits;
  public selectedMeasures: OrderedSet<string>;
  public pinnedDimensions: OrderedSet<string>;
  public colors: Colors;
  public pinnedSort: string;
  public compare: Filter;
  public highlight: Highlight;

  public visResolve: Resolve;

  constructor(parameters: EssenceValue) {
    this.visualizations = parameters.visualizations;

    this.dataSource = parameters.dataSource;
    if (!this.dataSource) throw new Error('must have a dataSource');

    this.timezone = parameters.timezone;
    this.filter = parameters.filter;
    this.splits = parameters.splits;
    this.selectedMeasures = parameters.selectedMeasures;
    this.pinnedDimensions = parameters.pinnedDimensions;
    this.colors = parameters.colors;
    this.pinnedSort = parameters.pinnedSort;
    this.compare = parameters.compare;
    this.highlight = parameters.highlight;

    // Place vis here because it needs to know about splits and colors (and maybe later other things)
    var visualization = parameters.visualization;
    if (!visualization) {
      var visAndResolve = this.getBestVisualization(this.splits, this.colors, null);
      visualization = visAndResolve.visualization;
    }
    this.visualization = visualization;

    var visResolve = visualization.handleCircumstance(this.dataSource, this.splits, this.colors, true);
    if (visResolve.isAutomatic()) {
      var adjustment = visResolve.adjustment;
      this.splits = adjustment.splits;
      this.colors = adjustment.colors || null;
      visResolve = visualization.handleCircumstance(this.dataSource, this.splits, this.colors, true);
      if (!visResolve.isReady()) {
        console.log(visResolve);
        throw new Error('visualization must be ready after automatic adjustment');
      }
    }
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
      selectedMeasures: this.selectedMeasures,
      pinnedDimensions: this.pinnedDimensions,
      colors: this.colors,
      pinnedSort: this.pinnedSort,
      compare: this.compare,
      highlight: this.highlight
    };
  }

  public toJS(): EssenceJS {
    var selectedMeasures = this.selectedMeasures.toArray();
    var pinnedDimensions = this.pinnedDimensions.toArray();
    var js: EssenceJS = {
      visualization: this.visualization.id,
      timezone: this.timezone.toJS(),
      filter: this.filter.toJS(),
      splits: this.splits.toJS(),
      selectedMeasures,
      pinnedDimensions
    };
    var defaultSortMeasure = this.dataSource.defaultSortMeasure;
    if (this.colors) js.colors = this.colors.toJS();
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
      this.selectedMeasures.equals(other.selectedMeasures) &&
      this.pinnedDimensions.equals(other.pinnedDimensions) &&
      Boolean(this.colors) === Boolean(other.colors) &&
      (!this.colors || this.colors.equals(other.colors)) &&
      this.pinnedSort === other.pinnedSort &&
      Boolean(this.compare) === Boolean(other.compare) &&
      (!this.compare || this.compare.equals(other.compare)) &&
      Boolean(this.highlight) === Boolean(other.highlight) &&
      (!this.highlight || this.highlight.equals(other.highlight));
  }

  public toHash(): string {
    var js = this.toJS();
    var compressed: any[] = [
      js.timezone,         // 0
      js.filter,           // 1
      js.splits,           // 2
      js.selectedMeasures, // 3
      js.pinnedDimensions, // 4
      js.pinnedSort        // 5
    ];
    if (js.colors)      compressed[6] = js.colors;
    if (js.compare)     compressed[7] = js.compare;
    if (js.highlight)   compressed[8] = js.highlight;

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

  public getBestVisualization(splits: Splits, colors: Colors, currentVisualization: Manifest): VisualizationAndResolve {
    var { visualizations, dataSource } = this;
    var visAndResolves = visualizations.toArray().map((visualization) => {
      return {
        visualization,
        resolve: visualization.handleCircumstance(dataSource, splits, colors, visualization === currentVisualization)
      };
    });

    return visAndResolves.sort((vr1, vr2) => Resolve.compare(vr1.resolve, vr2.resolve))[0];
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

  public getEffectiveFilter(highlightId: string = null, unfilterDimension: Dimension = null): Filter {
    var { dataSource, filter, highlight, timezone } = this;
    if (highlight && (highlightId !== highlight.owner)) filter = highlight.applyToFilter(filter);
    if (unfilterDimension) filter = filter.remove(unfilterDimension.expression);

    var maxTime = dataSource.getMaxTimeDate();
    return filter.getSpecificFilter(new Date(), maxTime, timezone);
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

  public differentColors(other: Essence): boolean {
    if (Boolean(this.colors) !== Boolean(other.colors)) return true;
    if (!this.colors) return false;
    return !this.colors.equals(other.colors);
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

  // Modification

  public changeFilter(filter: Filter, removeHighlight = false): Essence {
    var value = this.valueOf();
    value.filter = filter;

    if (removeHighlight) {
      value.highlight = null;
    }

    var timeAttribute = this.getTimeAttribute();
    if (timeAttribute) {
      var oldTimeSelection = this.filter.getSelection(timeAttribute);
      var newTimeSelection = filter.getSelection(timeAttribute);
      if (newTimeSelection && !newTimeSelection.equals(oldTimeSelection)) {
        value.splits = value.splits.updateWithTimeRange(timeAttribute, this.evaluateSelection(newTimeSelection), this.timezone, true);
      }
    }

    return new Essence(value);
  }

  public changeTimeSelection(check: Expression): Essence {
    var { filter } = this;
    var timeAttribute = this.getTimeAttribute();
    return this.changeFilter(filter.setSelection(timeAttribute, check));
  }

  public changeSplits(splits: Splits, strategy: VisStrategy): Essence {
    var { dataSource, visualization, visResolve, filter, colors } = this;

    var timeAttribute = this.getTimeAttribute();
    if (timeAttribute) {
      splits = splits.updateWithTimeRange(timeAttribute, this.evaluateSelection(filter.getSelection(timeAttribute)), this.timezone);
    }

    // If in manual mode stay there, keep the vis regardless of suggested strategy
    if (visResolve.isManual()) {
      strategy = VisStrategy.KeepAlways;
    }

    if (strategy !== VisStrategy.KeepAlways) {
      var visAndResolve = this.getBestVisualization(splits, colors, (strategy === VisStrategy.FairGame ? null : visualization));
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
      value = this.changeFilter(highlight.applyToFilter(this.filter)).valueOf();
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
