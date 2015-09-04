'use strict';

import { List, OrderedSet } from 'immutable';
import { compressToBase64, decompressFromBase64 } from 'lz-string';
import { ImmutableClass, ImmutableInstance, isInstanceOf, arraysEqual } from 'higher-object';
import { Timezone, Duration } from 'chronology';
import { $, Expression, ChainExpression, ExpressionJS, TimeRange } from 'plywood';
import { listsEqual } from '../../utils/general';
import { DataSource } from '../data-source/data-source';
import { Filter, FilterJS } from '../filter/filter';
import { Splits, SplitsJS } from '../splits/splits';
import { SplitCombine } from '../split-combine/split-combine';
import { Dimension } from '../dimension/dimension';
import { Measure } from '../measure/measure';
import { Manifest } from '../manifest/manifest';

const HASH_VERSION = 1;

interface EssenceValue {
  dataSources?: List<DataSource>;
  visualizations?: List<Manifest>;

  dataSource: DataSource;
  visualization: Manifest;
  timezone: Timezone;
  filter: Filter;
  splits: Splits;
  selectedMeasures: OrderedSet<string>;
  pinnedDimensions: OrderedSet<string>;
  highlight: ChainExpression;
}

interface EssenceJS {
  dataSource: string;
  visualization: string;
  timezone: string;
  filter: FilterJS;
  splits: SplitsJS;
  selectedMeasures: string[];
  pinnedDimensions: string[];
  highlight?: ExpressionJS;
}

var check: ImmutableClass<EssenceValue, EssenceJS>;
export class Essence implements ImmutableInstance<EssenceValue, EssenceJS> {
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

    if (!Array.isArray(jsArray) || !(jsArray.length === 5 || jsArray.length === 6)) return null;

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
        highlight: jsArray[5] || null
      }, dataSources, visualizations);
    } catch (e) {
      return null;
    }

    return essence;
  }

  static fromJS(parameters: EssenceJS, dataSources?: List<DataSource>, visualizations?: List<Manifest>): Essence {
    var dataSourceName = parameters.dataSource;
    var visualizationID = parameters.visualization;
    var visualization = visualizations.find(v => v.id === visualizationID);

    var dataSource = dataSources.find((ds) => ds.name === dataSourceName);
    var timezone = Timezone.fromJS(parameters.timezone);
    var filter = Filter.fromJS(parameters.filter);
    var splits = Splits.fromJS(parameters.splits);
    var selectedMeasures = OrderedSet(parameters.selectedMeasures);
    var pinnedDimensions = OrderedSet(parameters.pinnedDimensions);

    var highlight: ChainExpression = null;
    var highlightJS = parameters.highlight;
    if (highlightJS && highlightJS.op === 'chain') {
      highlight = <ChainExpression>Expression.fromJS(highlightJS);
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
  public highlight: ChainExpression;

  constructor(parameters: EssenceValue) {
    this.dataSources = parameters.dataSources;
    this.visualizations = parameters.visualizations;

    this.dataSource = parameters.dataSource;
    this.timezone = parameters.timezone;
    this.filter = parameters.filter;
    this.splits = parameters.splits;
    this.selectedMeasures = parameters.selectedMeasures;
    this.pinnedDimensions = parameters.pinnedDimensions;
    this.highlight = parameters.highlight;

    // Place vis here because it needs to know about splits (and maybe later other things)
    var visualization = parameters.visualization;
    if (visualization) {
      this.visualization = visualization;
    } else {
      this.visualization = this.getVisualizations().last();
    }
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
      highlight: this.highlight
    };
  }

  public toJS(): EssenceJS {
    var js: EssenceJS = {
      dataSource: this.dataSource.name,
      visualization: this.visualization.id,
      timezone: this.timezone.toJS(),
      filter: this.filter.toJS(),
      splits: this.splits.toJS(),
      selectedMeasures: this.selectedMeasures.toArray(),
      pinnedDimensions: this.pinnedDimensions.toArray()
    };
    if (this.highlight) {
      js.highlight = this.highlight.toJS();
    }
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
      this.pinnedDimensions.equals(other.pinnedDimensions);
  }

  public toHash(): string {
    var js: any = this.toJS();
    var compressed: any[] = [
      js.timezone,
      js.filter,
      js.splits,
      js.selectedMeasures,
      js.pinnedDimensions
    ];
    if (js.highlight) compressed.push(js.highlight);
    return '#' + [
      js.dataSource,
      js.visualization,
      HASH_VERSION,
      compressToBase64(compressed.map(p => JSON.stringify(p)).join(','))
    ].join('/');
  }

  public getURL(): string {
    return Essence.getBaseURL() + this.toHash();
  }

  public getVisualizations(): List<Manifest> {
    return this.computePossibleVisualizations(this.splits);
  }

  public computePossibleVisualizations(splits: Splits): List<Manifest> {
    var { visualizations, dataSource } = this;
    return <List<Manifest>>visualizations.filter(v => v.handleCircumstance(dataSource, splits).isReady());
  }

  public getTimeDimension(): Dimension {
    return this.dataSource.getDimension('time');
  }

  public getMeasures(): List<Measure> {
    var dataSource = this.dataSource;
    return <List<Measure>>this.selectedMeasures.toList().map(measureName => dataSource.getMeasure(measureName));
  }

  public differentOn(other: Essence, ...things: string[]): boolean {
    for (var thing of things) {
      switch (thing) {
        case 'timezone':
          if (!this.timezone.equals(other.timezone)) return true;
          break;

        case 'filter':
          if (!this.filter.equals(other.filter)) return true;
          break;

        case 'splits':
          if (!this.splits.equals(other.splits)) return true;
          break;

        case 'selectedMeasures':
          if (!this.selectedMeasures.equals(other.selectedMeasures)) return true;
          break;

        case 'pinnedDimensions':
          if (!this.pinnedDimensions.equals(other.pinnedDimensions)) return true;
          break;

        case 'highlight':
          if (Boolean(this.highlight) !== Boolean(other.highlight)) return true;
          if (this.highlight && !this.highlight.equals(other.highlight)) return true;
          break;

        default:
          throw new Error('can not diff on ' + thing);
      }
    }
    return false;
  }

  public highlightOn(dimension: Dimension): boolean {
    var { highlight } = this;
    if (!highlight) return false;
    return highlight.expression.equals(dimension.expression);
  }

  public getHighlighValue(): any {
    var { highlight } = this;
    if (!highlight) return null;
    return highlight.actions[0].getLiteralValue();
  }

  public getFilterExpression(): Expression {
    return this.filter.toExpression();
  }

  public getFilterHighlightExpression(excludeDimension?: Dimension): Expression {
    var { filter, highlight } = this;
    if (highlight && (!excludeDimension || !highlight.expression.equals(excludeDimension.expression))) {
      return filter.setClause(highlight).toExpression();
    } else {
      return filter.toExpression();
    }
  }

  // Modification

  public changeDataSource(dataSource: DataSource): Essence {
    var value = this.valueOf();

    var { dataSources } = this;
    var dataSourceName = dataSource.name;
    var existingDataSource = dataSources.find((ds) => ds.name === dataSourceName);
    if (!existingDataSource) throw new Error(`unknown DataSource changed: ${dataSourceName}`);

    value.dataSource = dataSource;
    if (!existingDataSource.equals(dataSource)) {
      // We are actually updating info within the named dataSource
      value.dataSources = <List<DataSource>>dataSources.map((ds) => ds.name === dataSourceName ? dataSource : ds);
    }
    return new Essence(value);
  }

  public changeFilter(filter: Filter): Essence {
    var value = this.valueOf();
    value.filter = filter;
    value.splits = value.splits.updateWithFilter(value.dataSource, value.filter);
    return new Essence(value);
  }

  public changeTimeRange(timeRange: TimeRange): Essence {
    var { dataSource, filter } = this;
    var timeDimension = this.getTimeDimension();
    return this.changeFilter(filter.setTimeRange(timeDimension.expression, timeRange));
  }

  public changeSplits(splits: Splits): Essence {
    var { visualization } = this;
    var visualizations = this.computePossibleVisualizations(splits);
    visualization = visualizations.last();

    var value = this.valueOf();
    value.splits = splits;
    value.visualization = visualization;
    if (value.highlight) {
      value.filter = value.filter.setClause(value.highlight);
      value.highlight = null;
    }
    return new Essence(value);
  }

  public changeSplit(splitCombine: SplitCombine): Essence {
    return this.changeSplits(Splits.fromSplitCombine(splitCombine));
  }

  public addSplit(split: SplitCombine): Essence {
    var { splits } = this;
    return this.changeSplits(splits.addSplit(split));
  }

  public removeSplit(split: SplitCombine): Essence {
    var { splits } = this;
    return this.changeSplits(splits.removeSplit(split));
  }

  public selectVisualization(visualization: Manifest): Essence {
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
    var value = this.valueOf();
    value.filter = value.filter.setClause(highlight);
    value.highlight = null;
    return new Essence(value);
  }

  public changeHighlight(highlight: ChainExpression): Essence {
    var value = this.valueOf();
    value.highlight = highlight;
    return new Essence(value);
  }

}
check = Essence;
