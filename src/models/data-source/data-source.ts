'use strict';

import { List } from 'immutable';
import { ImmutableClass, ImmutableInstance, isInstanceOf } from 'higher-object';
import { $, Expression, Dispatcher, basicDispatcherFactory, NativeDataset, Dataset } from 'plywood';
import { Dimension, DimensionJS } from '../dimension/dimension';
import { Measure, MeasureJS } from '../measure/measure';

function upperCaseFirst(title: string): string {
  return title[0].toUpperCase() + title.substring(1);
}

export interface DataSourceValue {
  name: string;
  title: string;
  dispatcher: Dispatcher;
  dimensions: List<Dimension>;
  measures: List<Measure>;
}

export interface DataSourceJS {
  name: string;
  title: string;
  dimensions: DimensionJS[];
  measures: MeasureJS[];
}

var check: ImmutableClass<DataSourceValue, DataSourceJS>;
export class DataSource implements ImmutableInstance<DataSourceValue, DataSourceJS> {

  public dispatcher: Dispatcher;
  public name: string;
  public title: string;
  public dimensions: List<Dimension>;
  public measures: List<Measure>;

  static isDataSource(candidate: any): boolean {
    return isInstanceOf(candidate, DataSource);
  }

  static fromNativeDataset(name: string, title: string, rawData: any[]): DataSource {
    var nativeDataset = <NativeDataset>Dataset.fromJS(rawData);
    nativeDataset.introspect();

    var attributes = nativeDataset.attributes;
    var dimensionArray: Dimension[] = [];
    var measureArray: Measure[] = [];

    if (!attributes['count']) {
      measureArray.push(new Measure({
        name: 'count',
        title: 'Count',
        expression: $('main').count()
      }));
    }

    for (let k in attributes) {
      if (!attributes.hasOwnProperty(k)) continue;
      let type = attributes[k].type;
      switch (type) {
        case 'STRING':
        case 'TIME':
          dimensionArray.push(new Dimension({
            name: k,
            title: upperCaseFirst(k),
            expression: $(k),
            type: type
          }));
          break;

        case 'NUMBER':
          measureArray.push(new Measure({
            name: k,
            title: upperCaseFirst(k),
            expression: $('main').sum($(k))
          }));
          break;

        default:
          throw new Error('bad type ' + type);
      }
    }

    dimensionArray.sort((a, b) => a.title.localeCompare(b.title));
    measureArray.sort((a, b) => a.title.localeCompare(b.title));

    var dispatcher = basicDispatcherFactory({
      datasets: {
        main: nativeDataset
      }
    });

    return new DataSource({
      name,
      title,
      dispatcher,
      dimensions: List(dimensionArray),
      measures: List(measureArray)
    });
  }

  static fromJS(parameters: DataSourceJS): DataSource {
    return new DataSource({
      dispatcher: null,
      name: parameters.name,
      title: parameters.title,
      dimensions: List(parameters.dimensions.map(Dimension.fromJS)),
      measures: List(parameters.measures.map(Measure.fromJS))
    });
  }

  constructor(parameters: DataSourceValue) {
    this.dispatcher = parameters.dispatcher;
    this.name = parameters.name;
    this.title = parameters.title;
    this.dimensions = parameters.dimensions;
    this.measures = parameters.measures;
  }

  public valueOf(): DataSourceValue {
    return {
      dispatcher: this.dispatcher,
      name: this.name,
      title: this.title,
      dimensions: this.dimensions,
      measures: this.measures
    };
  }

  public toJS(): DataSourceJS {
    return {
      name: this.name,
      title: this.title,
      dimensions: this.dimensions.toArray().map(dimension => dimension.toJS()),
      measures: this.measures.toArray().map(measure => measure.toJS())
    };
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
      this.dimensions.equals(other.dimensions) &&
      this.measures.equals(other.measures);
  }

  public changeDimensions(dimensions: List<Dimension>): DataSource {
    var value = this.valueOf();
    value.dimensions = dimensions;
    return new DataSource(value);
  }
}
check = DataSource;
