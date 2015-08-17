'use strict';

import { List } from 'immutable';
import * as d3 from 'd3';
import * as Q from 'q';
import * as Qajax from 'qajax';
import { ImmutableClass, ImmutableInstance, isInstanceOf, arraysEqual } from 'higher-object';
import { $, Expression, Dispatcher, basicDispatcherFactory, Dataset, Datum, Attributes, AttributeInfo, ChainExpression } from 'plywood';
import { upperCaseFirst, listsEqual } from '../../utils/general';
import { Dimension, DimensionJS } from '../dimension/dimension';
import { Measure, MeasureJS } from '../measure/measure';

function getSplitsDescription(ex: Expression): string {
  var splits: string[] = [];
  ex.forEach((ex) => {
    if (ex instanceof ChainExpression) {
      ex.actions.forEach((action) => {
        if (action.action === 'split') splits.push(action.expression.toString());
      });
    }
  });
  return splits.join(';');
}

function queryUrlDispatcherFactory(url: string): Dispatcher {
  return (ex: Expression) => {
    return Qajax({
      method: "POST",
      url: url + '?by=' + getSplitsDescription(ex),
      data: {
        dataset: 'wiki',
        expression: ex.toJS()
      }
    })
      .then(Qajax.filterSuccess)
      .then(Qajax.toJSON)
      .then((dataJS) => Dataset.fromJS(dataJS));
  };
}

function typePreference(dimension: Dimension): number {
  if (dimension.type === 'TIME') return 0;
  return 1;
}


interface DimensionsMetrics {
  dimensions: List<Dimension>;
  measures: List<Measure>;
  defaultSortOn: string;
}

function makeDimensionsMetricsFromAttributes(attributes: Attributes): DimensionsMetrics {
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

  dimensionArray.sort((a, b) => {
    var prefDiff = typePreference(a) - typePreference(b);
    if (prefDiff) return prefDiff;
    return a.title.localeCompare(b.title);
  });

  measureArray.sort((a, b) => a.title.localeCompare(b.title));

  if (!defaultSortOn && measureArray.length) {
    defaultSortOn = measureArray[0].name;
  }

  return {
    dimensions: List(dimensionArray),
    measures: List(measureArray),
    defaultSortOn
  };
}


export interface DataSourceValue {
  name: string;
  title: string;
  source: string;
  metadataLoaded: boolean;
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
  public metadataLoaded: boolean;
  public loadError: string;

  public dimensions: List<Dimension>;
  public measures: List<Measure>;
  public defaultSortOn: string;

  public dispatcher: Dispatcher;

  static isDataSource(candidate: any): boolean {
    return isInstanceOf(candidate, DataSource);
  }

  static fromQueryURL(name: string, title: string, source: string): DataSource {
    /*
     "dimensions":["continent","robot","country","city","newPage","unpatrolled","namespace","anonymous","language","page","region","user"],
     "metrics":["deleted","added","count","delta"]
     */

    var attributes: Attributes = {
      time: AttributeInfo.fromJS({ type: 'TIME' }),

      robot: AttributeInfo.fromJS({ type: 'STRING' }),
      newPage: AttributeInfo.fromJS({ type: 'STRING' }),
      unpatrolled: AttributeInfo.fromJS({ type: 'STRING' }),
      namespace: AttributeInfo.fromJS({ type: 'STRING' }),
      anonymous: AttributeInfo.fromJS({ type: 'STRING' }),
      language: AttributeInfo.fromJS({ type: 'STRING' }),
      page: AttributeInfo.fromJS({ type: 'STRING' }),
      user: AttributeInfo.fromJS({ type: 'STRING' }),

      count: AttributeInfo.fromJS({ type: 'NUMBER' }),
      added: AttributeInfo.fromJS({ type: 'NUMBER' }),
      deleted: AttributeInfo.fromJS({ type: 'NUMBER' }),
      delta: AttributeInfo.fromJS({ type: 'NUMBER' })
    };

    var dm = makeDimensionsMetricsFromAttributes(attributes);
    return new DataSource({
      name,
      title,
      source,
      metadataLoaded: true,
      loadError: null,
      dimensions: dm.dimensions,
      measures: dm.measures,
      defaultSortOn: dm.defaultSortOn,
      dispatcher: queryUrlDispatcherFactory(source)
    });
  }

  static fromDataFileURL(name: string, title: string, source: string): DataSource {
    return new DataSource({
      name,
      title,
      source,
      metadataLoaded: false,
      loadError: null
    });
  }

  static fromDataArray(name: string, title: string, source: string, rawData: any[]): DataSource {
    var mainDataset = Dataset.fromJS(rawData);
    mainDataset.introspect();

    var dispatcher = basicDispatcherFactory({
      datasets: {
        main: mainDataset
      }
    });

    var dm = makeDimensionsMetricsFromAttributes(mainDataset.attributes);
    return new DataSource({
      name,
      title,
      source,
      metadataLoaded: true,
      loadError: null,
      dimensions: dm.dimensions,
      measures: dm.measures,
      defaultSortOn: dm.defaultSortOn,
      dispatcher
    });
  }

  static fromJS(parameters: DataSourceJS): DataSource {
    var value: DataSourceValue = {
      dispatcher: null,
      name: parameters.name,
      title: parameters.title,
      source: parameters.source,
      metadataLoaded: false,
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
    this.metadataLoaded = parameters.metadataLoaded;
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
      metadataLoaded: this.metadataLoaded,
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
    if (this.metadataLoaded) throw new Error('already loaded');
    d3.json(this.source, (err, json) => {
      if (err) {

      } else {
        var secInHour = 60 * 60;
        json.forEach((d: Datum, i: number) => {
          d['time'] = new Date(Date.parse(d['time']) + (i % secInHour) * 1000);
        });

        deferred.resolve(DataSource.fromDataArray(this.name, this.title, this.source, json));
      }
    });
    return deferred.promise;
  }
}
check = DataSource;
