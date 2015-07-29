'use strict';

import { List } from 'immutable';
import { ImmutableClass, ImmutableInstance, isInstanceOf, arraysEqual } from 'higher-object';
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
  defaultSortOn: string;
}

export interface DataSourceJS {
  name: string;
  title: string;
  dimensions: DimensionJS[];
  measures: MeasureJS[];
  defaultSortOn: string;
}

var check: ImmutableClass<DataSourceValue, DataSourceJS>;
export class DataSource implements ImmutableInstance<DataSourceValue, DataSourceJS> {

  public dispatcher: Dispatcher;
  public name: string;
  public title: string;
  public dimensions: List<Dimension>;
  public measures: List<Measure>;
  public defaultSortOn: string;

  static isDataSource(candidate: any): boolean {
    return isInstanceOf(candidate, DataSource);
  }

  static fromNativeDataset(name: string, title: string, rawData: any[]): DataSource {
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
      dispatcher,
      dimensions: List(dimensionArray),
      measures: List(measureArray),
      defaultSortOn
    });
  }

  static fromJS(parameters: DataSourceJS): DataSource {
    return new DataSource({
      dispatcher: null,
      name: parameters.name,
      title: parameters.title,
      dimensions: List(parameters.dimensions.map(Dimension.fromJS)),
      measures: List(parameters.measures.map(Measure.fromJS)),
      defaultSortOn: parameters.defaultSortOn
    });
  }

  constructor(parameters: DataSourceValue) {
    this.dispatcher = parameters.dispatcher;
    this.name = parameters.name;
    this.title = parameters.title;
    this.dimensions = parameters.dimensions;
    this.measures = parameters.measures;
    this.defaultSortOn = parameters.defaultSortOn;
  }

  public valueOf(): DataSourceValue {
    return {
      dispatcher: this.dispatcher,
      name: this.name,
      title: this.title,
      dimensions: this.dimensions,
      measures: this.measures,
      defaultSortOn: this.defaultSortOn
    };
  }

  public toJS(): DataSourceJS {
    return {
      name: this.name,
      title: this.title,
      dimensions: this.dimensions.toArray().map(dimension => dimension.toJS()),
      measures: this.measures.toArray().map(measure => measure.toJS()),
      defaultSortOn: this.defaultSortOn
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
      arraysEqual(this.dimensions.toArray(), other.dimensions.toArray()) &&
      arraysEqual(this.measures.toArray(), other.measures.toArray()) &&
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
}
check = DataSource;
