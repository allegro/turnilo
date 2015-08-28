'use strict';

import { List, OrderedSet } from 'immutable';
import { compressToBase64, decompressFromBase64 } from 'lz-string';
import { ImmutableClass, ImmutableInstance, isInstanceOf, arraysEqual } from 'higher-object';
import { Timezone, Duration } from 'chronology';
import { $, Expression, TimeRange } from 'plywood';
import { listsEqual } from '../../utils/general';
import { DataSource } from '../data-source/data-source';
import { Filter, FilterJS } from '../filter/filter';
import { Splits, SplitsJS } from '../splits/splits';
import { SplitCombine } from '../split-combine/split-combine';
import { Dimension } from '../dimension/dimension';
import { Measure } from '../measure/measure';

const HASH_VERSION = 1;

interface EssenceValue {
  dataSources?: List<DataSource>;

  dataSource: DataSource;
  timezone: Timezone;
  filter: Filter;
  splits: Splits;
  selectedMeasures: OrderedSet<string>;
  pinnedDimensions: OrderedSet<string>;
  visualization: string;
}

interface EssenceJS {
  dataSource: string;
  timezone: string;
  filter: FilterJS;
  splits: SplitsJS;
  selectedMeasures: string[];
  pinnedDimensions: string[];
  visualization: string;
}

var check: ImmutableClass<EssenceValue, EssenceJS>;
export class Essence implements ImmutableInstance<EssenceValue, EssenceJS> {
  public dataSources: List<DataSource>;
  public dataSource: DataSource;
  public timezone: Timezone;
  public filter: Filter;
  public splits: Splits;
  public selectedMeasures: OrderedSet<string>;
  public pinnedDimensions: OrderedSet<string>;
  public visualization: string;

  static isEssence(candidate: any): boolean {
    return isInstanceOf(candidate, Essence);
  }

  static getBaseURL(): string {
    var url = window.location;
    return url.origin + url.pathname;
  }

  static fromHash(hash: string, dataSources: List<DataSource>): Essence {
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

    if (!Array.isArray(jsArray) || jsArray.length !== 5) return null;

    var essence: Essence;
    try {
      essence = Essence.fromJS({
        dataSource: dataSource,
        visualization: visualization,
        timezone: jsArray[0],
        filter: jsArray[1],
        splits: jsArray[2],
        selectedMeasures: jsArray[3],
        pinnedDimensions: jsArray[4]
      }, dataSources);
    } catch (e) {
      return null;
    }

    return essence;
  }

  static fromJS(parameters: EssenceJS, dataSources?: List<DataSource>): Essence {
    var dataSourceName = parameters.dataSource;
    var dataSource = dataSources.find((ds) => ds.name === dataSourceName);
    var timezone = Timezone.fromJS(parameters.timezone);
    var filter = Filter.fromJS(parameters.filter);
    var splits = Splits.fromJS(parameters.splits);
    var selectedMeasures = OrderedSet(parameters.selectedMeasures);
    var pinnedDimensions = OrderedSet(parameters.pinnedDimensions);
    var visualization = parameters.visualization;

    return new Essence({
      dataSources,
      dataSource,
      timezone,
      filter,
      splits,
      selectedMeasures,
      pinnedDimensions,
      visualization
    });
  }

  constructor(parameters: EssenceValue) {
    this.dataSources = parameters.dataSources;
    this.dataSource = parameters.dataSource;
    this.timezone = parameters.timezone;
    this.filter = parameters.filter;
    this.splits = parameters.splits;
    this.selectedMeasures = parameters.selectedMeasures;
    this.pinnedDimensions = parameters.pinnedDimensions;
    this.visualization = parameters.visualization;
    if (!this.visualization) {
      this.visualization = this.getVisualizations().last();
    }
  }

  public valueOf(): EssenceValue {
    return {
      dataSources: this.dataSources,
      dataSource: this.dataSource,
      timezone: this.timezone,
      filter: this.filter,
      splits: this.splits,
      selectedMeasures: this.selectedMeasures,
      pinnedDimensions: this.pinnedDimensions,
      visualization: this.visualization
    };
  }

  public toJS(): EssenceJS {
    return {
      dataSource: this.dataSource.name,
      timezone: this.timezone.toJS(),
      filter: this.filter.toJS(),
      splits: this.splits.toJS(),
      selectedMeasures: this.selectedMeasures.toArray(),
      pinnedDimensions: this.pinnedDimensions.toArray(),
      visualization: this.visualization
    };
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
      this.timezone.equals(other.timezone) &&
      this.filter.equals(other.filter) &&
      this.splits.equals(other.splits) &&
      // More
      this.visualization === other.visualization;
  }

  public toHash(): string {
    var js: any = this.toJS();
    return '#' + [
      js.dataSource,
      js.visualization,
      HASH_VERSION,
      compressToBase64([
        js.timezone,
        js.filter,
        js.splits,
        js.selectedMeasures,
        js.pinnedDimensions
      ].map(p => JSON.stringify(p)).join(','))
    ].join('/');
  }

  public getURL(): string {
    return Essence.getBaseURL() + this.toHash();
  }

  public getVisualizations(): List<string> {
    return this.computePossibleVisualizations(this.splits);
  }

  public computePossibleVisualizations(splits: Splits): List<string> {
    if (!splits.length()) return List(['totals']);

    var { dataSource } = this;
    var visArray: string[] = ['nested-table'];

    var lastSplit = splits.last();
    var splitDimension = lastSplit.getDimension(dataSource);
    if (splitDimension.type === 'TIME') {
      visArray.push('time-series');
    }

    return List(visArray);
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

        default:
          throw new Error('can not diff on ' + thing);
      }
    }
    return false;
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
    var timeDimension = dataSource.getDimension('time');
    return this.changeFilter(filter.setTimeRange(timeDimension.expression, timeRange));
  }

  public changeSplits(splits: Splits): Essence {
    var { visualization } = this;
    var visualizations = this.computePossibleVisualizations(splits);
    visualization = visualizations.last();

    var value = this.valueOf();
    value.splits = splits;
    value.visualization = visualization;
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

  public selectVisualization(visualization: string): Essence {
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
    var value = this.valueOf();
    var selectedMeasures = value.selectedMeasures;
    var measureName = measure.name;

    value.selectedMeasures = selectedMeasures.has(measureName) ?
      selectedMeasures.delete(measureName) :
      selectedMeasures.add(measureName);

    return new Essence(value);
  }

}
check = Essence;
