'use strict';

import { List } from 'immutable';
import * as d3 from 'd3';
import * as Q from 'q';
import { Class, Instance, isInstanceOf, arraysEqual } from 'immutable-class';
import { Timezone, hour } from 'chronoshift';
import { $, Expression, ExpressionJS, Executor, RefExpression, basicExecutorFactory, Dataset, Datum, Attributes, AttributeInfo, ChainExpression } from 'plywood';
import { makeTitle, listsEqual } from '../../utils/general';
import { Dimension, DimensionJS } from '../dimension/dimension';
import { Measure, MeasureJS } from '../measure/measure';

function dimensionPreference(dimension: Dimension): number {
  if (dimension.type === 'TIME') return 0;
  return 1;
}

function measurePreference(measure: Measure): number {
  if (measure.name === 'count') return 0;
  return 1;
}

interface DimensionsMetrics {
  dimensions: List<Dimension>;
  measures: List<Measure>;
  timeAttribute: RefExpression;
  defaultSortOn: string;
}

function makeDimensionsMetricsFromAttributes(attributes: Attributes): DimensionsMetrics {
  var dimensionArray: Dimension[] = [];
  var measureArray: Measure[] = [];
  var timeAttribute = RefExpression.fromJS({ op: 'ref', name: 'time' });
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
    let attribute = attributes[k];
    let type = attribute.type;
    switch (type) {
      case 'TIME':
        dimensionArray.push(Dimension.fromJS({
          name: k,
          type: type
        }));
        break;

      case 'STRING':
        if (attribute.special === 'unique') {
          measureArray.push(Measure.fromJS({
            name: k,
            expression: $('main').countDistinct($(k)).toJS(),
            format: Measure.INTEGER_FORMAT
          }));
        } else {
          dimensionArray.push(Dimension.fromJS({
            name: k,
            type: type
          }));
        }
        break;

      case 'NUMBER':
        measureArray.push(Measure.fromJS({
          name: k
        }));
        break;

      default:
        throw new Error('bad type ' + type);
    }
  }

  dimensionArray.sort((a, b) => {
    var prefDiff = dimensionPreference(a) - dimensionPreference(b);
    if (prefDiff) return prefDiff;
    return a.title.localeCompare(b.title);
  });

  measureArray.sort((a, b) => {
    var prefDiff = measurePreference(a) - measurePreference(b);
    if (prefDiff) return prefDiff;
    return a.title.localeCompare(b.title);
  });

  if (!defaultSortOn && measureArray.length) {
    defaultSortOn = measureArray[0].name;
  }

  return {
    dimensions: List(dimensionArray),
    measures: List(measureArray),
    timeAttribute,
    defaultSortOn
  };
}


export interface DataSourceValue {
  name: string;
  title: string;
  source: string;
  metadataLoaded: boolean;
  loadError: string;

  maxTime?: Date;
  dimensions?: List<Dimension>;
  measures?: List<Measure>;
  timeAttribute?: RefExpression;
  defaultSortOn?: string;

  executor?: Executor;
}

export interface DataSourceJS {
  name: string;
  title: string;
  source: string;

  maxTime?: Date;
  dimensions?: DimensionJS[];
  measures?: MeasureJS[];
  timeAttribute?: string;
  defaultSortOn?: string;
}

var check: Class<DataSourceValue, DataSourceJS>;
export class DataSource implements Instance<DataSourceValue, DataSourceJS> {
  static isDataSource(candidate: any): boolean {
    return isInstanceOf(candidate, DataSource);
  }

  static fromDataFileURL(name: string, title: string, source: string, maxTime: Date): DataSource {
    return new DataSource({
      name,
      title,
      source,
      metadataLoaded: false,
      loadError: null,
      maxTime
    });
  }

  static fromDataArray(name: string, title: string, source: string, maxTime: Date, rawData: any[]): DataSource {
    var mainDataset = Dataset.fromJS(rawData);
    mainDataset.introspect();

    var executor = basicExecutorFactory({
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
      maxTime,
      dimensions: dm.dimensions,
      measures: dm.measures,
      timeAttribute: dm.timeAttribute,
      defaultSortOn: dm.defaultSortOn,
      executor
    });
  }

  static fromJS(parameters: DataSourceJS, executor: Executor = null): DataSource {
    var value: DataSourceValue = {
      executor: null,
      name: parameters.name,
      title: parameters.title,
      source: parameters.source || 'default-source',
      metadataLoaded: Boolean(parameters.dimensions && parameters.measures),
      loadError: null
    };
    if (parameters.maxTime) {
      value.maxTime = new Date(<any>parameters.maxTime);
    }
    if (parameters.dimensions) {
      value.dimensions = List(parameters.dimensions.map(Dimension.fromJS));
      value.measures = List(parameters.measures.map(Measure.fromJS));
      value.timeAttribute = parameters.timeAttribute ? RefExpression.fromJS({ op: 'ref', name: parameters.timeAttribute }) : null;
      value.defaultSortOn = parameters.defaultSortOn || value.measures.get(0).name;
    }
    if (executor) {
      value.executor = executor;
    }
    return new DataSource(value);
  }


  public name: string;
  public title: string;
  public source: string;
  public metadataLoaded: boolean;
  public loadError: string;

  public maxTime: Date;
  public dimensions: List<Dimension>;
  public measures: List<Measure>;
  public timeAttribute: RefExpression;
  public defaultSortOn: string;

  public executor: Executor;

  constructor(parameters: DataSourceValue) {
    this.name = parameters.name;
    this.title = parameters.title;
    this.source = parameters.source;
    this.metadataLoaded = parameters.metadataLoaded;
    this.loadError = parameters.loadError;
    if (parameters.maxTime) {
      this.maxTime = parameters.maxTime;
      if (isNaN(this.maxTime.valueOf())) throw new Error('invalid maxTime date');
    } else {
      this.maxTime = null;
    }
    this.dimensions = parameters.dimensions;
    this.measures = parameters.measures;
    this.timeAttribute = parameters.timeAttribute;
    this.defaultSortOn = parameters.defaultSortOn;
    this.executor = parameters.executor;
  }

  public valueOf(): DataSourceValue {
    var value: DataSourceValue = {
      name: this.name,
      title: this.title,
      source: this.source,
      metadataLoaded: this.metadataLoaded,
      loadError: this.loadError
    };
    if (this.maxTime) {
      value.maxTime = this.maxTime;
    }
    if (this.dimensions) {
      value.dimensions = this.dimensions;
      value.measures = this.measures;
      value.timeAttribute = this.timeAttribute;
      value.defaultSortOn = this.defaultSortOn;
    }
    if (this.executor) {
      value.executor = this.executor;
    }
    return value;
  }

  public toJS(): DataSourceJS {
    var js: DataSourceJS = {
      name: this.name,
      title: this.title,
      source: this.source
    };
    if (this.maxTime) {
      js.maxTime = this.maxTime;
    }
    if (this.dimensions) {
      js.dimensions = this.dimensions.toArray().map(dimension => dimension.toJS());
      js.measures = this.measures.toArray().map(measure => measure.toJS());
      js.timeAttribute = this.timeAttribute.name;
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
      Boolean(this.timeAttribute) === Boolean(other.timeAttribute) &&
      (!this.timeAttribute || this.timeAttribute.equals(other.timeAttribute)) &&
      this.defaultSortOn === other.defaultSortOn;
  }

  public getMaxTime(): Date {
    var maxTime = this.maxTime;
    if (maxTime) return maxTime;
    return hour.ceil(new Date(), Timezone.UTC);
  }

  public getDimension(dimensionName: string): Dimension {
    return this.dimensions.find(dimension => dimension.name === dimensionName);
  }

  public getDimensionByExpression(expression: Expression): Dimension {
    return this.dimensions.find(dimension => dimension.expression.equals(expression));
  }

  public getTimeDimension() {
    return this.getDimensionByExpression(this.timeAttribute);
  }

  public isTimeAttribute(ex: Expression) {
    var { timeAttribute } = this;
    return ex.equals(this.timeAttribute);
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
        // Temp hack
        var secInHour = 60 * 60;
        json.forEach((d: Datum, i: number) => {
          d['time'] = new Date(Date.parse(d['time']) + (103 * i % secInHour) * 1000);
        });

        deferred.resolve(DataSource.fromDataArray(this.name, this.title, this.source, this.maxTime, json));
      }
    });
    return deferred.promise;
  }
}
check = DataSource;
