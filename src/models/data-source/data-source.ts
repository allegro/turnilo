'use strict';

import { List } from 'immutable';
import * as d3 from 'd3';
import * as Q from 'q';
import { ImmutableClass, ImmutableInstance, isInstanceOf, arraysEqual } from 'higher-object';
import { $, Expression, Dispatcher, basicDispatcherFactory, NativeDataset, Dataset, Datum } from 'plywood';
import { Dimension, DimensionJS } from '../dimension/dimension';
import { Measure, MeasureJS } from '../measure/measure';

function upperCaseFirst(title: string): string {
  return title[0].toUpperCase() + title.substring(1);
}

function listsEqual<T>(listA: List<T>, listB: List<T>): boolean {
  if (listA === listB) return true;
  if (!listA || !listB) return false;
  return arraysEqual(listA.toArray(), listB.toArray());
}

export interface DataSourceValue {
  name: string;
  title: string;
  source: string;
  dataLoaded: boolean;
  loadError: string;

  dimensions?: List<Dimension>;
  measures?: List<Measure>;
  defaultSortOn?: string;

  dispatcher?: Dispatcher;
}

export interface DataSourceJS {
  name: string;
  title: string;
  source: string;

  dimensions?: DimensionJS[];
  measures?: MeasureJS[];
  defaultSortOn?: string;
}

var check: ImmutableClass<DataSourceValue, DataSourceJS>;
export class DataSource implements ImmutableInstance<DataSourceValue, DataSourceJS> {

  public name: string;
  public title: string;
  public source: string;
  public dataLoaded: boolean;
  public loadError: string;

  public dimensions: List<Dimension>;
  public measures: List<Measure>;
  public defaultSortOn: string;

  public dispatcher: Dispatcher;

  static isDataSource(candidate: any): boolean {
    return isInstanceOf(candidate, DataSource);
  }

  static fromDataURL(name: string, title: string, source: string): DataSource {
    return new DataSource({
      name,
      title,
      source,
      dataLoaded: false,
      loadError: null
    });
  }

  static fromDataArray(name: string, title: string, source: string, rawData: any[]): DataSource {
    var nativeDataset = <NativeDataset>Dataset.fromJS(rawData);
    nativeDataset.introspect();

    var attributes = nativeDataset.attributes;
    var dimensionArray: Dimension[] = [];
    var measureArray: Measure[] = [];
    var defaultSortOn: string = null;

    if (!attributes['count']) {
      measureArray.push(new Measure({
        name: 'count',
        title: 'Count',
        expression: $('main').count(),
        format: Measure.DEFAULT_FORMAT
      }));
      defaultSortOn = 'count';
    }

    for (let k in attributes) {
      if (!attributes.hasOwnProperty(k)) continue;
      let type = attributes[k].type;
      switch (type) {
        case 'TIME':
        case 'STRING':
          dimensionArray.push(new Dimension({
            name: k,
            title: upperCaseFirst(k),
            expression: $(k),
            type: type,
            sortOn: null
          }));
          break;

        case 'NUMBER':
          measureArray.push(new Measure({
            name: k,
            title: upperCaseFirst(k),
            expression: $('main').sum($(k)),
            format: Measure.DEFAULT_FORMAT
          }));
          break;

        default:
          throw new Error('bad type ' + type);
      }
    }

    dimensionArray.sort((a, b) => a.title.localeCompare(b.title));
    measureArray.sort((a, b) => a.title.localeCompare(b.title));

    if (!defaultSortOn && measureArray.length) {
      defaultSortOn = measureArray[0].name;
    }

    var dispatcher = basicDispatcherFactory({
      datasets: {
        main: nativeDataset
      }
    });

    return new DataSource({
      name,
      title,
      source,
      dataLoaded: true,
      loadError: null,
      dimensions: List(dimensionArray),
      measures: List(measureArray),
      defaultSortOn,
      dispatcher
    });
  }

  static fromJS(parameters: DataSourceJS): DataSource {
    var value: DataSourceValue = {
      dispatcher: null,
      name: parameters.name,
      title: parameters.title,
      source: parameters.source,
      dataLoaded: false,
      loadError: null
    };
    if (parameters.dimensions) {
      value.dimensions = List(parameters.dimensions.map(Dimension.fromJS));
      value.measures = List(parameters.measures.map(Measure.fromJS));
      value.defaultSortOn = parameters.defaultSortOn;
    }
    return new DataSource(value);
  }

  constructor(parameters: DataSourceValue) {
    this.name = parameters.name;
    this.title = parameters.title;
    this.source = parameters.source;
    this.dataLoaded = parameters.dataLoaded;
    this.loadError = parameters.loadError;
    this.dimensions = parameters.dimensions;
    this.measures = parameters.measures;
    this.defaultSortOn = parameters.defaultSortOn;
    this.dispatcher = parameters.dispatcher;
  }

  public valueOf(): DataSourceValue {
    var value: DataSourceValue = {
      name: this.name,
      title: this.title,
      source: this.source,
      dataLoaded: this.dataLoaded,
      loadError: this.loadError
    };
    if (this.dimensions) {
      value.dimensions = this.dimensions;
      value.measures = this.measures;
      value.defaultSortOn = this.defaultSortOn;
    }
    if (this.dispatcher) {
      value.dispatcher = this.dispatcher;
    }
    return value;
  }

  public toJS(): DataSourceJS {
    var js: DataSourceJS = {
      name: this.name,
      title: this.title,
      source: this.source
    };
    if (this.dimensions) {
      js.dimensions = this.dimensions.toArray().map(dimension => dimension.toJS());
      js.measures = this.measures.toArray().map(measure => measure.toJS());
      js.defaultSortOn = this.defaultSortOn;
    }
    return js;
  }

  public toJSON(): DataSourceJS {
    return this.toJS();
  }

  public toString(): string {
    return `[DataSource: ${this.name}]`;
  }

  public equals(other: DataSource): boolean {
    return DataSource.isDataSource(other) &&
      this.name === other.name &&
      this.title === other.title &&
      this.source === other.source &&
      listsEqual(this.dimensions, other.dimensions) &&
      listsEqual(this.measures, other.measures) &&
      this.defaultSortOn === other.defaultSortOn;
  }

  public getDimension(dimensionName: string): Dimension {
    return this.dimensions.find(dimension => dimension.name === dimensionName);
  }

  public getMeasure(measureName: string): Measure {
    return this.measures.find(measure => measure.name === measureName);
  }

  public getSortMeasure(dimension: Dimension): Measure {
    var sortOn = dimension.sortOn || this.defaultSortOn;
    return this.getMeasure(sortOn);
  }

  public changeDimensions(dimensions: List<Dimension>): DataSource {
    var value = this.valueOf();
    value.dimensions = dimensions;
    return new DataSource(value);
  }

  public loadSource(): Q.Promise<DataSource> {
    var deferred = <Q.Deferred<DataSource>>Q.defer();
    if (this.dataLoaded) throw new Error('already loaded');
    var self = this;
    d3.json(this.source, (err, json) => {
      if (err) {

      } else {
        var secInHour = 60 * 60;
        json.forEach((d: Datum, i: number) => {
          d['time'] = new Date(Date.parse(d['time']) + (i % secInHour) * 1000);
        });

        deferred.resolve(DataSource.fromDataArray(self.name, self.title, self.source, json));
      }
    });
    return deferred.promise;
  }
}
check = DataSource;
