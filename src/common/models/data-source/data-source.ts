'use strict';

import * as Q from 'q';
import { List, OrderedSet } from 'immutable';
import { Class, Instance, isInstanceOf, arraysEqual } from 'immutable-class';
import { Duration, Timezone, minute } from 'chronoshift';
import { ply, $, Expression, ExpressionJS, Executor, RefExpression, basicExecutorFactory, Dataset, Datum, Attributes, AttributeInfo, ChainExpression, SortAction } from 'plywood';
import { makeTitle, listsEqual } from '../../utils/general/general';
import { Dimension, DimensionJS } from '../dimension/dimension';
import { Measure, MeasureJS } from '../measure/measure';
import { MaxTime, MaxTimeJS } from '../max-time/max-time';
import { RefreshRule, RefreshRuleJS } from '../refresh-rule/refresh-rule';

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

function getDefaultPinnedDimensions(dimensions: List<Dimension>): OrderedSet<string> {
  return OrderedSet(
    dimensions
      .toArray()
      .filter((d) => d.type === 'STRING')
      .slice(0, 3)
      .map((d) => d.name)
  );
}


export interface DataSourceValue {
  name: string;
  title?: string;
  engine: string;
  source: string;
  options?: Lookup<any>;
  dimensions: List<Dimension>;
  measures: List<Measure>;
  timeAttribute: RefExpression;
  defaultTimezone: Timezone;
  defaultDuration: Duration;
  defaultSortMeasure: string;
  defaultPinnedDimensions?: OrderedSet<string>;
  refreshRule: RefreshRule;
  maxTime?: MaxTime;

  executor?: Executor;
}

export interface DataSourceJS {
  name: string;
  title?: string;
  engine: string;
  source: string;
  options?: Lookup<any>;
  dimensions?: DimensionJS[];
  measures?: MeasureJS[];
  timeAttribute?: string;
  defaultTimezone?: string;
  defaultDuration?: string;
  defaultSortMeasure?: string;
  defaultPinnedDimensions?: string[];
  refreshRule?: RefreshRuleJS;
  maxTime?: MaxTimeJS;
}

var check: Class<DataSourceValue, DataSourceJS>;
export class DataSource implements Instance<DataSourceValue, DataSourceJS> {
  static isDataSource(candidate: any): boolean {
    return isInstanceOf(candidate, DataSource);
  }

  static updateMaxTime(dataSource: DataSource): Q.Promise<DataSource> {
    if (!dataSource.shouldQueryMaxTime()) return Q(dataSource);

    var ex = ply().apply('maxTime', $('main').max(dataSource.timeAttribute));

    return dataSource.executor(ex).then((dataset: Dataset) => {
      var maxTimeDate = dataset.data[0]['maxTime'];
      if (!isNaN(maxTimeDate)) {
        return dataSource.changeMaxTime(MaxTime.fromDate(maxTimeDate));
      }
      return dataSource;
    });
  }

  static fromJS(parameters: DataSourceJS, executor: Executor = null): DataSource {
    var dimensions = makeUniqueDimensionList((parameters.dimensions || []).map((d) => Dimension.fromJS(d)));
    var measures = makeUniqueMeasureList((parameters.measures || []).map((m) => Measure.fromJS(m)));

    var value: DataSourceValue = {
      executor: null,
      name: parameters.name,
      title: parameters.title,
      engine: parameters.engine,
      source: parameters.source,
      options: parameters.options,
      dimensions,
      measures,
      timeAttribute: parameters.timeAttribute ? $(parameters.timeAttribute) : null,
      defaultTimezone: Timezone.fromJS(parameters.defaultTimezone || 'Etc/UTC'),
      defaultDuration: Duration.fromJS(parameters.defaultDuration || 'P3D'),
      defaultSortMeasure: parameters.defaultSortMeasure || (measures.size ? measures.first().name : null),
      defaultPinnedDimensions: parameters.defaultPinnedDimensions ? OrderedSet(parameters.defaultPinnedDimensions) : getDefaultPinnedDimensions(dimensions),
      refreshRule: parameters.refreshRule ? RefreshRule.fromJS(parameters.refreshRule) : RefreshRule.query(),
      maxTime: parameters.maxTime ? MaxTime.fromJS(parameters.maxTime) : null
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
  public options: Lookup<any>;
  public dimensions: List<Dimension>;
  public measures: List<Measure>;
  public timeAttribute: RefExpression;
  public defaultTimezone: Timezone;
  public defaultDuration: Duration;
  public defaultSortMeasure: string;
  public defaultPinnedDimensions: OrderedSet<string>;
  public refreshRule: RefreshRule;
  public maxTime: MaxTime;

  public executor: Executor;

  constructor(parameters: DataSourceValue) {
    var name = parameters.name;
    this.name = name;
    this.title = parameters.title || makeTitle(name);
    this.engine = parameters.engine;
    this.source = parameters.source;
    this.options = parameters.options || {};
    this.dimensions = parameters.dimensions || List([]);
    this.measures = parameters.measures || List([]);
    this.timeAttribute = parameters.timeAttribute;
    this.defaultTimezone = parameters.defaultTimezone;
    this.defaultDuration = parameters.defaultDuration;
    this.defaultSortMeasure = parameters.defaultSortMeasure;
    this.defaultPinnedDimensions = parameters.defaultPinnedDimensions;
    this.refreshRule = parameters.refreshRule;
    this.maxTime = parameters.maxTime;

    this.executor = parameters.executor;
  }

  public valueOf(): DataSourceValue {
    var value: DataSourceValue = {
      name: this.name,
      title: this.title,
      engine: this.engine,
      source: this.source,
      options: this.options,
      dimensions: this.dimensions,
      measures: this.measures,
      timeAttribute: this.timeAttribute,
      defaultTimezone: this.defaultTimezone,
      defaultDuration: this.defaultDuration,
      defaultSortMeasure: this.defaultSortMeasure,
      defaultPinnedDimensions: this.defaultPinnedDimensions,
      refreshRule: this.refreshRule,
      maxTime: this.maxTime
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
      defaultTimezone: this.defaultTimezone.toJS(),
      defaultDuration: this.defaultDuration.toJS(),
      defaultSortMeasure: this.defaultSortMeasure,
      defaultPinnedDimensions: this.defaultPinnedDimensions.toArray(),
      refreshRule: this.refreshRule.toJS()
    };
    if (Object.keys(this.options).length) {
      js.options = this.options;
    }
    if (this.maxTime) {
      js.maxTime = this.maxTime.toJS();
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
      JSON.stringify(this.options) === JSON.stringify(other.options) &&
      listsEqual(this.dimensions, other.dimensions) &&
      listsEqual(this.measures, other.measures) &&
      Boolean(this.timeAttribute) === Boolean(other.timeAttribute) &&
      (!this.timeAttribute || this.timeAttribute.equals(other.timeAttribute)) &&
      this.defaultTimezone.equals(other.defaultTimezone) &&
      this.defaultDuration.equals(other.defaultDuration) &&
      this.defaultSortMeasure === other.defaultSortMeasure &&
      this.defaultPinnedDimensions.equals(other.defaultPinnedDimensions) &&
      this.refreshRule.equals(other.refreshRule);
  }

  public attachExecutor(executor: Executor): DataSource {
    var value = this.valueOf();
    value.executor = executor;
    return new DataSource(value);
  }

  public isQueryable(): boolean {
    return Boolean(this.executor);
  }

  public getMaxTimeDate(): Date {
    var { refreshRule } = this;
    if (refreshRule.rule === 'realtime') {
      return minute.ceil(new Date(), Timezone.UTC);
    } else if (refreshRule.rule === 'fixed') {
      return refreshRule.time;
    } else { //refreshRule.rule === 'query'
      var { maxTime } = this;
      if (!maxTime) return null;
      return maxTime.time;
    }
  }

  public shouldQueryMaxTime(): boolean {
    if (!this.executor) return false;
    return this.refreshRule.shouldQuery(this.maxTime);
  }

  public getDimension(dimensionName: string): Dimension {
    return Dimension.getDimension(this.dimensions, dimensionName);
  }

  public getDimensionByExpression(expression: Expression): Dimension {
    return Dimension.getDimensionByExpression(this.dimensions, expression);
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

  public getMeasureByExpression(expression: Expression): Measure {
    return this.measures.find(measure => measure.expression.equals(expression));
  }

  public changeDimensions(dimensions: List<Dimension>): DataSource {
    var value = this.valueOf();
    value.dimensions = dimensions;
    return new DataSource(value);
  }

  public addAttributes(attributes: Attributes): DataSource {
    var { dimensions, measures } = this;

    for (var attribute of attributes) {
      var { name, type } = attribute;
      var expression: Expression;
      switch (type) {
        case 'TIME':
          expression = $(name);
          if (this.getDimensionByExpression(expression)) continue;
          // Add to the start
          dimensions = dimensions.unshift(new Dimension({
            name,
            type: type
          }));
          break;

        case 'STRING':
          if (attribute.special === 'unique') {
            expression = $('main').countDistinct($(name));
            if (this.getMeasureByExpression(expression)) continue;
            measures = measures.push(new Measure({
              name,
              expression,
              format: Measure.INTEGER_FORMAT
            }));
          } else {
            expression = $(name);
            if (this.getDimensionByExpression(expression)) continue;
            dimensions = dimensions.push(new Dimension({
              name,
              type: type
            }));
          }
          break;

        case 'BOOLEAN':
          expression = $(name);
          if (this.getDimensionByExpression(expression)) continue;
          dimensions = dimensions.push(new Dimension({
            name,
            type: type
          }));
          break;

        case 'NUMBER':
          if (attribute.special === 'histogram') continue;
          expression = $('main').sum($(name));
          if (this.getMeasureByExpression(expression)) continue;
          var newMeasure = new Measure({ name });
          measures = (name === 'count') ? measures.unshift(newMeasure) : measures.push(newMeasure);
          break;

        default:
          throw new Error('unsupported type ' + type);
      }
    }

    if (this.measures === measures && this.dimensions === dimensions) return this;

    var value = this.valueOf();
    value.dimensions = dimensions;
    value.measures = measures;
    if (!value.defaultPinnedDimensions.size) {
      value.defaultPinnedDimensions = getDefaultPinnedDimensions(dimensions);
    }
    return new DataSource(value);
  }

  public changeMaxTime(maxTime: MaxTime) {
    var value = this.valueOf();
    value.maxTime = maxTime;
    return new DataSource(value);
  }

  public getDefaultSortAction(): SortAction {
    return new SortAction({
      expression: $(this.defaultSortMeasure),
      direction: SortAction.DESCENDING
    });
  }
}
check = DataSource;
