'use strict';

import { List, OrderedSet } from 'immutable';
import { Class, Instance, isInstanceOf, arraysEqual } from 'immutable-class';
import { Duration, Timezone, hour } from 'chronoshift';
import { $, Expression, ExpressionJS, Executor, RefExpression, basicExecutorFactory, Dataset, Datum, Attributes, AttributeInfo, ChainExpression } from 'plywood';
import { makeTitle, listsEqual } from '../../utils/general/general';
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

function makeUniqueDimensionList(dimensions: Dimension[]): List<Dimension> {
  var seen: Lookup<number> = {};
  return List(dimensions.filter((dimension) => {
    var dimensionName = dimension.name.toLowerCase();
    if (seen[dimensionName]) return false;
    seen[dimensionName] = 1;
    return true;
  }));
}

function makeUniqueMeasureList(measures: Measure[]): List<Measure> {
  var seen: Lookup<number> = {};
  return List(measures.filter((measure) => {
    var measureName = measure.name.toLowerCase();
    if (seen[measureName]) return false;
    seen[measureName] = 1;
    return true;
  }));
}

interface DimensionsMetrics {
  dimensions: List<Dimension>;
  measures: List<Measure>;
  timeAttribute: RefExpression;
  defaultSortMeasure: string;
}

function makeDimensionsMetricsFromAttributes(attributes: Attributes): DimensionsMetrics {
  var dimensionArray: Dimension[] = [];
  var measureArray: Measure[] = [];
  var timeAttribute = $('time');
  var defaultSortMeasure: string = null;

  if (!attributes['count']) {
    measureArray.push(new Measure({
      name: 'count',
      title: 'Count',
      expression: $('main').count(),
      format: Measure.DEFAULT_FORMAT
    }));
    defaultSortMeasure = 'count';
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

  if (!defaultSortMeasure && measureArray.length) {
    defaultSortMeasure = measureArray[0].name;
  }

  return {
    dimensions: List(dimensionArray),
    measures: List(measureArray),
    timeAttribute,
    defaultSortMeasure
  };
}


export interface DataSourceValue {
  name: string;
  title: string;
  engine: string;
  source: string;
  dimensions: List<Dimension>;
  measures: List<Measure>;
  timeAttribute: RefExpression;
  maxTime?: Date;
  defaultDuration: Duration;
  defaultSortMeasure: string;
  defaultPinnedDimensions?: OrderedSet<string>;

  executor?: Executor;
}

export interface DataSourceJS {
  name: string;
  title: string;
  engine: string;
  source: string;
  dimensions: DimensionJS[];
  measures: MeasureJS[];
  timeAttribute: string;
  maxTime?: Date;
  defaultDuration: string;
  defaultSortMeasure: string;
  defaultPinnedDimensions?: string[];
}

var check: Class<DataSourceValue, DataSourceJS>;
export class DataSource implements Instance<DataSourceValue, DataSourceJS> {
  static isDataSource(candidate: any): boolean {
    return isInstanceOf(candidate, DataSource);
  }

  static fromJS(parameters: DataSourceJS, executor: Executor = null): DataSource {
    var dimensions = makeUniqueDimensionList(parameters.dimensions.map(Dimension.fromJS));
    var measures = makeUniqueMeasureList(parameters.measures.map(Measure.fromJS));

    var value: DataSourceValue = {
      executor: null,
      name: parameters.name,
      title: parameters.title,
      engine: parameters.engine,
      source: parameters.source,
      dimensions,
      measures,
      timeAttribute: parameters.timeAttribute ? $(parameters.timeAttribute) : null,
      maxTime: parameters.maxTime ? new Date(<any>parameters.maxTime) : null,
      defaultDuration: Duration.fromJS(parameters.defaultDuration || 'P3D'),
      defaultSortMeasure: parameters.defaultSortMeasure || measures.get(0).name,
      defaultPinnedDimensions: OrderedSet(parameters.defaultPinnedDimensions || dimensions.toArray().slice(1, 4).map((d) => d.name))
    };
    if (executor) {
      value.executor = executor;
    }
    return new DataSource(value);
  }


  public name: string;
  public title: string;
  public engine: string;
  public source: string;
  public dimensions: List<Dimension>;
  public measures: List<Measure>;
  public timeAttribute: RefExpression;
  public defaultDuration: Duration;
  public defaultSortMeasure: string;
  public defaultPinnedDimensions: OrderedSet<string>;
  public maxTime: Date;

  public executor: Executor;

  constructor(parameters: DataSourceValue) {
    this.name = parameters.name;
    this.title = parameters.title;
    this.engine = parameters.engine;
    this.source = parameters.source;
    this.dimensions = parameters.dimensions;
    this.measures = parameters.measures;
    this.timeAttribute = parameters.timeAttribute;
    this.defaultDuration = parameters.defaultDuration;
    this.defaultSortMeasure = parameters.defaultSortMeasure;
    this.defaultPinnedDimensions = parameters.defaultPinnedDimensions;

    if (parameters.maxTime) {
      this.maxTime = parameters.maxTime;
      if (isNaN(this.maxTime.valueOf())) throw new Error('invalid maxTime date');
    } else {
      this.maxTime = null;
    }

    this.executor = parameters.executor;
  }

  public valueOf(): DataSourceValue {
    var value: DataSourceValue = {
      name: this.name,
      title: this.title,
      engine: this.engine,
      source: this.source,
      dimensions: this.dimensions,
      measures: this.measures,
      timeAttribute: this.timeAttribute,
      maxTime: this.maxTime,
      defaultDuration: this.defaultDuration,
      defaultSortMeasure: this.defaultSortMeasure,
      defaultPinnedDimensions: this.defaultPinnedDimensions
    };
    if (this.executor) {
      value.executor = this.executor;
    }
    return value;
  }

  public toJS(): DataSourceJS {
    var js: DataSourceJS = {
      name: this.name,
      title: this.title,
      engine: this.engine,
      source: this.source,
      dimensions: this.dimensions.toArray().map(dimension => dimension.toJS()),
      measures: this.measures.toArray().map(measure => measure.toJS()),
      timeAttribute: this.timeAttribute.name,
      defaultDuration: this.defaultDuration.toJS(),
      defaultSortMeasure: this.defaultSortMeasure,
      defaultPinnedDimensions: this.defaultPinnedDimensions.toArray()
    };
    if (this.maxTime) {
      js.maxTime = this.maxTime;
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
      this.engine === other.engine &&
      this.source === other.source &&
      listsEqual(this.dimensions, other.dimensions) &&
      listsEqual(this.measures, other.measures) &&
      Boolean(this.timeAttribute) === Boolean(other.timeAttribute) &&
      (!this.timeAttribute || this.timeAttribute.equals(other.timeAttribute)) &&
      this.defaultDuration.equals(other.defaultDuration) &&
      this.defaultSortMeasure === other.defaultSortMeasure &&
      this.defaultPinnedDimensions.equals(other.defaultPinnedDimensions);
  }

  public getMaxTime(): Date {
    var maxTime = this.maxTime;
    if (maxTime) return maxTime;
    return hour.ceil(new Date(), Timezone.UTC);
  }

  public getDimension(dimensionName: string): Dimension {
    dimensionName = dimensionName.toLowerCase(); // Case insensitive
    return this.dimensions.find(dimension => dimension.name.toLowerCase() === dimensionName);
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
    measureName = measureName.toLowerCase(); // Case insensitive
    return this.measures.find(measure => measure.name.toLowerCase() === measureName);
  }

  public getSortMeasure(dimension: Dimension): Measure {
    var sortOn = dimension.sortOn || this.defaultSortMeasure;
    return this.getMeasure(sortOn);
  }

  public changeDimensions(dimensions: List<Dimension>): DataSource {
    var value = this.valueOf();
    value.dimensions = dimensions;
    return new DataSource(value);
  }

}
check = DataSource;
