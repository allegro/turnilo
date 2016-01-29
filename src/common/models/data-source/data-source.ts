'use strict';

import * as Q from 'q';
import { List, OrderedSet } from 'immutable';
import { Class, Instance, isInstanceOf, arraysEqual } from 'immutable-class';
import { Duration, Timezone, minute, second } from 'chronoshift';
import { ply, $, Expression, ExpressionJS, Executor, RefExpression, basicExecutorFactory, Dataset, Datum, Attributes, AttributeInfo, ChainExpression, SortAction } from 'plywood';
import { makeTitle, listsEqual } from '../../utils/general/general';
import { Dimension, DimensionJS } from '../dimension/dimension';
import { Measure, MeasureJS } from '../measure/measure';
import { Filter, FilterJS } from '../filter/filter';
import { MaxTime, MaxTimeJS } from '../max-time/max-time';
import { RefreshRule, RefreshRuleJS } from '../refresh-rule/refresh-rule';

function formatTimeDiff(diff: number): string {
  diff = Math.round(Math.abs(diff) / 1000); // turn to seconds
  if (diff < 60) return 'less than 1 minute';

  diff = Math.floor(diff / 60); // turn to minutes
  if (diff === 1) return '1 minute';
  if (diff < 60) return diff + ' minutes';

  diff = Math.floor(diff / 60); // turn to hours
  if (diff === 1) return '1 hour';
  if (diff <= 24) return diff + ' hours';

  diff = Math.floor(diff / 24); // turn to days
  return diff + ' days';
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


export interface DataSourceValue {
  name: string;
  title?: string;
  engine: string;
  source: string;
  subsetFilter?: Expression;
  options?: Lookup<any>;
  introspection: string;
  dimensions: List<Dimension>;
  measures: List<Measure>;
  timeAttribute: RefExpression;
  minGranularity: Duration;
  defaultTimezone: Timezone;
  defaultFilter: Filter;
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
  subsetFilter?: ExpressionJS;
  options?: Lookup<any>;
  introspection?: string;
  dimensions?: DimensionJS[];
  measures?: MeasureJS[];
  timeAttribute?: string;
  minGranularity?: string;
  defaultTimezone?: string;
  defaultFilter?: FilterJS;
  defaultDuration?: string;
  defaultSortMeasure?: string;
  defaultPinnedDimensions?: string[];
  refreshRule?: RefreshRuleJS;
  maxTime?: MaxTimeJS;
}

var check: Class<DataSourceValue, DataSourceJS>;
export class DataSource implements Instance<DataSourceValue, DataSourceJS> {
  static DEFAULT_INTROSPECTION = 'autofill-all';
  static INTROSPECTION_VALUES = ['none', 'no-autofill', 'autofill-dimensions-only', 'autofill-measures-only', 'autofill-all'];
  static DEFAULT_TIMEZONE = Timezone.UTC;
  static DEFAULT_DURATION = Duration.fromJS('P3D');

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

    var engine = parameters.engine;
    var timeAttributeName = parameters.timeAttribute;
    if (engine === 'druid' && !timeAttributeName) {
      timeAttributeName = 'time';
    }
    var timeAttribute = timeAttributeName ? $(timeAttributeName) : null;

    if (timeAttribute && !Dimension.getDimensionByExpression(dimensions, timeAttribute)) {
      dimensions = dimensions.unshift(new Dimension({
        name: timeAttributeName,
        expression: timeAttribute,
        kind: 'time'
      }));
    }

    var introspection = parameters.introspection;

    // Back compat.
    var options = parameters.options || {};
    if (options['skipIntrospection']) {
      if (!introspection) introspection = 'none';
      delete options['skipIntrospection'];
    }
    if (options['disableAutofill']) {
      if (!introspection) introspection = 'no-autofill';
      delete options['disableAutofill'];
    }

    introspection = introspection || DataSource.DEFAULT_INTROSPECTION;
    if (DataSource.INTROSPECTION_VALUES.indexOf(introspection) === -1) {
      throw new Error(`invalid introspection value ${introspection}, must be one of ${DataSource.INTROSPECTION_VALUES.join(', ')}`);
    }

    var value: DataSourceValue = {
      executor: null,
      name: parameters.name,
      title: parameters.title,
      engine,
      source: parameters.source,
      subsetFilter: parameters.subsetFilter ? Expression.fromJSLoose(parameters.subsetFilter) : null,
      options,
      introspection,
      dimensions,
      measures,
      timeAttribute,
      minGranularity: parameters.minGranularity ? Duration.fromJS(parameters.minGranularity) : null,
      defaultTimezone: parameters.defaultTimezone ? Timezone.fromJS(parameters.defaultTimezone) : DataSource.DEFAULT_TIMEZONE,
      defaultFilter: parameters.defaultFilter ? Filter.fromJS(parameters.defaultFilter) : Filter.EMPTY,
      defaultDuration: parameters.defaultDuration ? Duration.fromJS(parameters.defaultDuration) : DataSource.DEFAULT_DURATION,
      defaultSortMeasure: parameters.defaultSortMeasure || (measures.size ? measures.first().name : null),
      defaultPinnedDimensions: OrderedSet(parameters.defaultPinnedDimensions || []),
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
  public subsetFilter: Expression;
  public options: Lookup<any>;
  public introspection: string;
  public dimensions: List<Dimension>;
  public measures: List<Measure>;
  public timeAttribute: RefExpression;
  public minGranularity: Duration;
  public defaultTimezone: Timezone;
  public defaultFilter: Filter;
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
    this.subsetFilter = parameters.subsetFilter;
    this.options = parameters.options || {};
    this.introspection = parameters.introspection || DataSource.DEFAULT_INTROSPECTION;
    this.dimensions = parameters.dimensions || List([]);
    this.measures = parameters.measures || List([]);
    this.timeAttribute = parameters.timeAttribute;
    this.minGranularity = parameters.minGranularity;
    this.defaultTimezone = parameters.defaultTimezone;
    this.defaultFilter = parameters.defaultFilter;
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
      subsetFilter: this.subsetFilter,
      options: this.options,
      introspection: this.introspection,
      dimensions: this.dimensions,
      measures: this.measures,
      timeAttribute: this.timeAttribute,
      minGranularity: this.minGranularity,
      defaultTimezone: this.defaultTimezone,
      defaultFilter: this.defaultFilter,
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
      subsetFilter: this.subsetFilter ? this.subsetFilter.toJS() : null,
      introspection: this.introspection,
      dimensions: this.dimensions.toArray().map(dimension => dimension.toJS()),
      measures: this.measures.toArray().map(measure => measure.toJS()),
      defaultTimezone: this.defaultTimezone.toJS(),
      defaultFilter: this.defaultFilter.toJS(),
      defaultDuration: this.defaultDuration.toJS(),
      defaultSortMeasure: this.defaultSortMeasure,
      defaultPinnedDimensions: this.defaultPinnedDimensions.toArray(),
      refreshRule: this.refreshRule.toJS()
    };
    if (this.timeAttribute) {
      js.timeAttribute = this.timeAttribute.name;
    }
    if (this.minGranularity) {
      js.minGranularity = this.minGranularity.toJS();
    }
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
      Boolean(this.subsetFilter) === Boolean(other.subsetFilter) &&
      (!this.subsetFilter || this.subsetFilter.equals(other.subsetFilter)) &&
      JSON.stringify(this.options) === JSON.stringify(other.options) &&
      this.introspection === other.introspection &&
      listsEqual(this.dimensions, other.dimensions) &&
      listsEqual(this.measures, other.measures) &&
      Boolean(this.timeAttribute) === Boolean(other.timeAttribute) &&
      (!this.timeAttribute || this.timeAttribute.equals(other.timeAttribute)) &&
      Boolean(this.minGranularity) === Boolean(other.minGranularity) &&
      (!this.minGranularity || this.minGranularity.equals(other.minGranularity)) &&
      this.defaultTimezone.equals(other.defaultTimezone) &&
      this.defaultFilter.equals(other.defaultFilter) &&
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

  public toClientDataSource(): DataSource {
    var value = this.valueOf();
    value.subsetFilter = null;
    value.introspection = 'none';
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
      return second.ceil(maxTime.time, Timezone.UTC);
    }
  }

  public updatedText(): string {
    var { refreshRule } = this;
    if (refreshRule.rule === 'realtime') {
      return 'Updated: ~1 second ago';
    } else if (refreshRule.rule === 'fixed') {
      return `Fixed to: ${formatTimeDiff(Date.now() - refreshRule.time.valueOf())}`;
    } else { //refreshRule.rule === 'query'
      var { maxTime } = this;
      if (maxTime) {
        return `Updated: ${formatTimeDiff(Date.now() - maxTime.time.valueOf())} ago`;
      } else {
        return null;
      }
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

  public getDimensionByKind(kind: string): List<Dimension> {
    return <List<Dimension>>this.dimensions.filter((d) => d.kind === kind);
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

  public rolledUp(): boolean {
    return this.engine === 'druid';
  }

  public addAttributes(attributes: Attributes): DataSource {
    var { introspection, dimensions, measures } = this;
    if (introspection === 'none' || introspection === 'no-autofill') return this;
    var autofillDimensions = introspection === 'autofill-dimensions-only' || introspection === 'autofill-all';
    var autofillMeasures = introspection === 'autofill-measures-only' || introspection === 'autofill-all';

    var $main = $('main');

    for (var attribute of attributes) {
      var { name, type } = attribute;
      var expression: Expression;
      switch (type) {
        case 'TIME':
          if (!autofillDimensions) continue;
          expression = $(name);
          if (this.getDimensionByExpression(expression)) continue;
          // Add to the start
          dimensions = dimensions.unshift(new Dimension({
            name,
            kind: 'time'
          }));
          break;

        case 'STRING':
          if (attribute.special === 'unique') {
            if (!autofillMeasures) continue;

            var newMeasures = Measure.measuresFromAttributeInfo(attribute);
            newMeasures.forEach((newMeasure) => {
              if (this.getMeasureByExpression(newMeasure.expression)) return;
              measures = measures.push(newMeasure);
            });
          } else {
            if (!autofillDimensions) continue;
            expression = $(name);
            if (this.getDimensionByExpression(expression)) continue;
            dimensions = dimensions.push(new Dimension({
              name
            }));
          }
          break;

        case 'BOOLEAN':
          if (!autofillDimensions) continue;
          expression = $(name);
          if (this.getDimensionByExpression(expression)) continue;
          dimensions = dimensions.push(new Dimension({
            name,
            kind: 'boolean'
          }));
          break;

        case 'NUMBER':
          if (!autofillMeasures) continue;

          var newMeasures = Measure.measuresFromAttributeInfo(attribute);
          newMeasures.forEach((newMeasure) => {
            if (this.getMeasureByExpression(newMeasure.expression)) return;
            measures = (name === 'count') ? measures.unshift(newMeasure) : measures.push(newMeasure);
          });
          break;

        default:
          throw new Error('unsupported type ' + type);
      }
    }

    if (!this.rolledUp() && !measures.find(m => m.name === 'count')) {
      measures = measures.unshift(new Measure({
        name: 'count',
        expression: $main.count()
      }));
    }

    var value = this.valueOf();
    value.introspection = 'no-autofill';
    value.dimensions = dimensions;
    value.measures = measures;

    if (!value.defaultSortMeasure) {
      value.defaultSortMeasure = measures.size ? measures.first().name : null;
    }

    // ToDo: remove this when Pivot can handle it
    if (!value.timeAttribute && dimensions.first().kind === 'time') {
      value.timeAttribute = <RefExpression>dimensions.first().expression;
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
