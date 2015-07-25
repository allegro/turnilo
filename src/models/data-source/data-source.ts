'use strict';

import { ImmutableClass, ImmutableInstance, isInstanceOf, arraysEqual } from 'higher-object';
import { $, Expression, Dispatcher, basicDispatcherFactory, NativeDataset, Dataset } from 'plywood';
import { Dimension, DimensionJS } from '../dimension/dimension';
import { Measure, MeasureJS } from '../measure/measure';

function upperCaseFirst(title: string): string {
  return title[0].toUpperCase() + title.substring(1);
}

export interface DataSourceValue {
  title: string;
  dispatcher: Dispatcher;
  dimensions: Dimension[];
  measures: Measure[];
}

export interface DataSourceJS {
  title: string;
  dimensions: DimensionJS[];
  measures: MeasureJS[];
}

var check: ImmutableClass<DataSourceValue, DataSourceJS>;
export class DataSource implements ImmutableInstance<DataSourceValue, DataSourceJS> {

  public dispatcher: Dispatcher;
  public title: string;
  public dimensions: Dimension[];
  public measures: Measure[];

  static isDataSource(candidate: any): boolean {
    return isInstanceOf(candidate, DataSource);
  }

  static fromNativeDataset(title: string, rawData: any[]): DataSource {
    var nativeDataset = <NativeDataset>Dataset.fromJS(rawData);
    nativeDataset.introspect();

    var attributes = nativeDataset.attributes;
    var dimensions: Dimension[] = [];
    var measures: Measure[] = [];

    if (!attributes['count']) {
      measures.push(new Measure({
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
          dimensions.push(new Dimension({
            name: k,
            title: upperCaseFirst(k),
            expression: $(k),
            type: type
          }));
          break;

        case 'NUMBER':
          measures.push(new Measure({
            name: k,
            title: upperCaseFirst(k),
            expression: $('main').sum($(k))
          }));
          break;

        default:
          throw new Error('bad type ' + type);
      }
    }

    dimensions.sort((a, b) => a.title.localeCompare(b.title));
    measures.sort((a, b) => a.title.localeCompare(b.title));

    var dispatcher = basicDispatcherFactory({
      datasets: {
        main: nativeDataset
      }
    });

    return new DataSource({ title, dispatcher, dimensions, measures });
  }

  static fromJS(parameters: DataSourceJS): DataSource {
    return new DataSource({
      dispatcher: null,
      title: parameters.title,
      dimensions: parameters.dimensions.map(Dimension.fromJS),
      measures: parameters.measures.map(Measure.fromJS)
    });
  }

  constructor(parameters: DataSourceValue) {
    this.dispatcher = parameters.dispatcher;
    this.title = parameters.title;
    this.dimensions = parameters.dimensions;
    this.measures = parameters.measures;
  }

  public valueOf(): DataSourceValue {
    return {
      dispatcher: this.dispatcher,
      title: this.title,
      dimensions: this.dimensions,
      measures: this.measures
    };
  }

  public toJS(): DataSourceJS {
    return {
      title: this.title,
      dimensions: this.dimensions.map(dimension => dimension.toJS()),
      measures: this.measures.map(measure => measure.toJS())
    };
  }

  public toJSON(): DataSourceJS {
    return this.toJS();
  }

  public toString(): string {
    return `[DataSource: ${this.title}]`;
  }

  public equals(other: DataSource): boolean {
    return DataSource.isDataSource(other) &&
      this.title === other.title &&
      arraysEqual(this.dimensions, other.dimensions) &&
      arraysEqual(this.measures, other.measures);
  }

  public changeDimensions(dimensions: Dimension[]): DataSource {
    var value = this.valueOf();
    value.dimensions = dimensions;
    return new DataSource(value);
  }
}
check = DataSource;
