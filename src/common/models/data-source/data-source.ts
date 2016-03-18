import * as Q from 'q';
import { List, OrderedSet } from 'immutable';
import { Class, Instance, isInstanceOf, arraysEqual } from 'immutable-class';
import { Duration, Timezone, minute, second } from 'chronoshift';
import { ply, $, Expression, ExpressionJS, Executor, RefExpression, basicExecutorFactory, Dataset, Datum,
  Attributes, AttributeInfo, AttributeJSs, ChainExpression, SortAction, SimpleFullType, DatasetFullType,
  CustomDruidAggregations, helper } from 'plywood';
import { verifyUrlSafeName, makeTitle, listsEqual } from '../../utils/general/general';
import { Dimension, DimensionJS } from '../dimension/dimension';
import { Measure, MeasureJS } from '../measure/measure';
import { Filter, FilterJS } from '../filter/filter';
import { SplitsJS } from '../splits/splits';
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
  options?: DataSourceOptions;
  introspection: string;
  attributeOverrides: Attributes;
  attributes: Attributes;
  dimensions: List<Dimension>;
  measures: List<Measure>;
  timeAttribute: RefExpression;
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
  options?: DataSourceOptions;
  introspection?: string;
  attributeOverrides?: AttributeJSs;
  attributes?: AttributeJSs;
  dimensions?: DimensionJS[];
  measures?: MeasureJS[];
  timeAttribute?: string;
  defaultTimezone?: string;
  defaultFilter?: FilterJS;
  defaultDuration?: string;
  defaultSortMeasure?: string;
  defaultPinnedDimensions?: string[];
  refreshRule?: RefreshRuleJS;
  maxTime?: MaxTimeJS;
}

export interface DataSourceOptions {
  customAggregations?: CustomDruidAggregations;
  defaultSplits?: SplitsJS;

  // Deprecated
  defaultSplitDimension?: string;
  skipIntrospection?: boolean;
  disableAutofill?: boolean;
  attributeOverrides?: AttributeJSs;
}

var check: Class<DataSourceValue, DataSourceJS>;
export class DataSource implements Instance<DataSourceValue, DataSourceJS> {
  static DEFAULT_INTROSPECTION = 'autofill-all';
  static INTROSPECTION_VALUES = ['none', 'no-autofill', 'autofill-dimensions-only', 'autofill-measures-only', 'autofill-all'];
  static DEFAULT_TIMEZONE = Timezone.UTC;
  static DEFAULT_DURATION = Duration.fromJS('P1D');

  static isDataSource(candidate: any): candidate is DataSource {
    return isInstanceOf(candidate, DataSource);
  }

  static updateMaxTime(dataSource: DataSource): Q.Promise<DataSource> {
    if (!dataSource.shouldUpdateMaxTime()) return Q(dataSource);

    if (dataSource.refreshRule.isRealtime()) {
      return Q(dataSource.changeMaxTime(MaxTime.fromNow()));
    }

    var ex = ply().apply('maxTime', $('main').max(dataSource.timeAttribute));

    return dataSource.executor(ex).then((dataset: Dataset) => {
      var maxTimeDate = <Date>dataset.data[0]['maxTime'];
      if (!isNaN(maxTimeDate as any)) {
        return dataSource.changeMaxTime(MaxTime.fromDate(maxTimeDate));
      }
      return dataSource;
    });
  }

  static fromJS(parameters: DataSourceJS, executor: Executor = null): DataSource {
    var engine = parameters.engine;
    var introspection = parameters.introspection;
    var attributeOverrideJSs = parameters.attributeOverrides;

    // Back compat.
    var options = parameters.options || {};
    if (options.skipIntrospection) {
      if (!introspection) introspection = 'none';
      delete options.skipIntrospection;
    }
    if (options.disableAutofill) {
      if (!introspection) introspection = 'no-autofill';
      delete options.disableAutofill;
    }
    if (options.attributeOverrides) {
      if (!attributeOverrideJSs) attributeOverrideJSs = options.attributeOverrides;
      delete options.attributeOverrides;
    }
    if (options.defaultSplitDimension) {
      options.defaultSplits = options.defaultSplitDimension;
      delete options.defaultSplitDimension;
    }
    // End Back compat.

    introspection = introspection || DataSource.DEFAULT_INTROSPECTION;
    if (DataSource.INTROSPECTION_VALUES.indexOf(introspection) === -1) {
      throw new Error(`invalid introspection value ${introspection}, must be one of ${DataSource.INTROSPECTION_VALUES.join(', ')}`);
    }

    var refreshRule = parameters.refreshRule ? RefreshRule.fromJS(parameters.refreshRule) : RefreshRule.query();

    var maxTime = parameters.maxTime ? MaxTime.fromJS(parameters.maxTime) : null;
    if (!maxTime && refreshRule.isRealtime()) {
      maxTime = MaxTime.fromNow();
    }

    var timeAttributeName = parameters.timeAttribute;
    if (engine === 'druid' && !timeAttributeName) {
      timeAttributeName = '__time';
    }
    var timeAttribute = timeAttributeName ? $(timeAttributeName) : null;

    var attributeOverrides = AttributeInfo.fromJSs(attributeOverrideJSs || []);
    var attributes = AttributeInfo.fromJSs(parameters.attributes || []);
    var dimensions = makeUniqueDimensionList((parameters.dimensions || []).map((d) => Dimension.fromJS(d)));
    var measures = makeUniqueMeasureList((parameters.measures || []).map((m) => Measure.fromJS(m)));

    if (timeAttribute && !Dimension.getDimensionByExpression(dimensions, timeAttribute)) {
      dimensions = dimensions.unshift(new Dimension({
        name: timeAttributeName,
        expression: timeAttribute,
        kind: 'time'
      }));
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
      attributeOverrides,
      attributes,
      dimensions,
      measures,
      timeAttribute,
      defaultTimezone: parameters.defaultTimezone ? Timezone.fromJS(parameters.defaultTimezone) : DataSource.DEFAULT_TIMEZONE,
      defaultFilter: parameters.defaultFilter ? Filter.fromJS(parameters.defaultFilter) : Filter.EMPTY,
      defaultDuration: parameters.defaultDuration ? Duration.fromJS(parameters.defaultDuration) : DataSource.DEFAULT_DURATION,
      defaultSortMeasure: parameters.defaultSortMeasure || (measures.size ? measures.first().name : null),
      defaultPinnedDimensions: OrderedSet(parameters.defaultPinnedDimensions || []),
      refreshRule,
      maxTime
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
  public options: DataSourceOptions;
  public introspection: string;
  public attributes: Attributes;
  public attributeOverrides: Attributes;
  public dimensions: List<Dimension>;
  public measures: List<Measure>;
  public timeAttribute: RefExpression;
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
    verifyUrlSafeName(name);
    this.name = name;
    this.title = parameters.title || makeTitle(name);
    this.engine = parameters.engine || 'druid';
    this.source = parameters.source || name;
    this.subsetFilter = parameters.subsetFilter;
    this.options = parameters.options || {};
    this.introspection = parameters.introspection || DataSource.DEFAULT_INTROSPECTION;
    this.attributes = parameters.attributes || [];
    this.attributeOverrides = parameters.attributeOverrides || [];
    this.dimensions = parameters.dimensions || List([]);
    this.measures = parameters.measures || List([]);
    this.timeAttribute = parameters.timeAttribute;
    this.defaultTimezone = parameters.defaultTimezone;
    this.defaultFilter = parameters.defaultFilter;
    this.defaultDuration = parameters.defaultDuration;
    this.defaultSortMeasure = parameters.defaultSortMeasure;
    this.defaultPinnedDimensions = parameters.defaultPinnedDimensions;
    this.refreshRule = parameters.refreshRule;
    this.maxTime = parameters.maxTime;

    this.executor = parameters.executor;

    this._validateDefaults();
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
      attributeOverrides: this.attributeOverrides,
      attributes: this.attributes,
      dimensions: this.dimensions,
      measures: this.measures,
      timeAttribute: this.timeAttribute,
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
    if (this.timeAttribute) js.timeAttribute = this.timeAttribute.name;
    if (this.attributeOverrides.length) js.attributeOverrides = AttributeInfo.toJSs(this.attributeOverrides);
    if (this.attributes.length) js.attributes = AttributeInfo.toJSs(this.attributes);
    if (Object.keys(this.options).length) js.options = this.options;
    if (this.maxTime) js.maxTime = this.maxTime.toJS();
    return js;
  }

  public toJSON(): DataSourceJS {
    return this.toJS();
  }

  public toString(): string {
    return `[DataSource: ${this.name}]`;
  }

  public equals(other: DataSource): boolean {
    return this.equalsWithoutMaxTime(other) &&
      Boolean(this.maxTime) === Boolean(other.maxTime) &&
      (!this.maxTime || this.maxTime.equals(other.maxTime));
  }

  public equalsWithoutMaxTime(other: DataSource): boolean {
    return DataSource.isDataSource(other) &&
      this.name === other.name &&
      this.title === other.title &&
      this.engine === other.engine &&
      this.source === other.source &&
      Boolean(this.subsetFilter) === Boolean(other.subsetFilter) &&
      (!this.subsetFilter || this.subsetFilter.equals(other.subsetFilter)) &&
      JSON.stringify(this.options) === JSON.stringify(other.options) &&
      this.introspection === other.introspection &&
      arraysEqual(this.attributeOverrides, other.attributeOverrides) &&
      arraysEqual(this.attributes, other.attributes) &&
      listsEqual(this.dimensions, other.dimensions) &&
      listsEqual(this.measures, other.measures) &&
      Boolean(this.timeAttribute) === Boolean(other.timeAttribute) &&
      (!this.timeAttribute || this.timeAttribute.equals(other.timeAttribute)) &&
      this.defaultTimezone.equals(other.defaultTimezone) &&
      this.defaultFilter.equals(other.defaultFilter) &&
      this.defaultDuration.equals(other.defaultDuration) &&
      this.defaultSortMeasure === other.defaultSortMeasure &&
      this.defaultPinnedDimensions.equals(other.defaultPinnedDimensions) &&
      this.refreshRule.equals(other.refreshRule);
  }

  private _validateDefaults() {
    var { measures, defaultSortMeasure } = this;

    if (defaultSortMeasure) {
      if (!measures.find((measure) => measure.name === defaultSortMeasure)) {
        throw new Error(`can not find defaultSortMeasure '${defaultSortMeasure}' in data source '${this.name}'`);
      }
    }
  }

  public getMainTypeContext(): DatasetFullType {
    var { attributes } = this;
    if (!attributes) return null;

    var datasetType: Lookup<SimpleFullType> = {};
    for (var attribute of attributes) {
      datasetType[attribute.name] = (attribute as any);
    }

    return {
      type: 'DATASET',
      datasetType
    };
  }

  public getIssues(): string[] {
    var { dimensions, measures } = this;
    var mainTypeContext = this.getMainTypeContext();
    var issues: string[] = [];

    dimensions.forEach((dimension) => {
      try {
        dimension.expression.referenceCheckInTypeContext(mainTypeContext);
      } catch (e) {
        issues.push(`failed to validate dimension '${dimension.name}': ${e.message}`);
      }
    });

    var measureTypeContext: DatasetFullType = {
      type: 'DATASET',
      datasetType: {
        main: mainTypeContext
      }
    };

    measures.forEach((measure) => {
      try {
        measure.expression.referenceCheckInTypeContext(measureTypeContext);
      } catch (e) {
        var message = e.message;
        // If we get here it is possible that the user has misunderstood what the meaning of a measure is and have tried
        // to do something like $volume / $volume. We detect this here by checking for a reference to $main
        // If there is no main reference raise a more informative issue.
        if (measure.expression.getFreeReferences().indexOf('main') === -1) {
          message = 'measure must contain a $main reference';
        }
        issues.push(`failed to validate measure '${measure.name}': ${message}`);
      }
    });

    return issues;
  }

  public attachExecutor(executor: Executor): DataSource {
    var value = this.valueOf();
    value.executor = executor;
    return new DataSource(value);
  }

  public toClientDataSource(): DataSource {
    var value = this.valueOf();

    // Do not reveal the subset filter to the client
    value.subsetFilter = null;

    // No need for any introspection on the client
    value.introspection = 'none';

    // No point sending over the maxTime
    if (this.refreshRule.isRealtime()) {
      value.maxTime = null;
    }

    // No need for the overrides
    value.attributeOverrides = null;

    return new DataSource(value);
  }

  public isQueryable(): boolean {
    return Boolean(this.executor);
  }

  public getMaxTimeDate(): Date {
    var { refreshRule } = this;
    if (refreshRule.isFixed()) return refreshRule.time;

    // refreshRule is query or realtime
    var { maxTime } = this;
    if (!maxTime) return null;
    return second.ceil(maxTime.time, Timezone.UTC);
  }

  public updatedText(): string {
    var { refreshRule } = this;
    if (refreshRule.isRealtime()) {
      return 'Updated: ~1 second ago';
    } else if (refreshRule.isFixed()) {
      return `Fixed to: ${formatTimeDiff(Date.now() - refreshRule.time.valueOf())}`;
    } else { // refreshRule is query
      var { maxTime } = this;
      if (maxTime) {
        return `Updated: ${formatTimeDiff(Date.now() - maxTime.time.valueOf())} ago`;
      } else {
        return null;
      }
    }
  }

  public shouldUpdateMaxTime(): boolean {
    if (!this.refreshRule.shouldUpdate(this.maxTime)) return false;
    return Boolean(this.executor) || this.refreshRule.isRealtime();
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

  /**
   * This function tries to deduce the structure of the dataSource based on the dimensions and measures defined within.
   * It should only be used when, for some reason, introspection if not available.
   */
  public deduceAttributes(): Attributes {
    const { dimensions, measures, timeAttribute, attributeOverrides } = this;
    var attributes: Attributes = [];

    if (timeAttribute) {
      attributes.push(AttributeInfo.fromJS({ name: timeAttribute.name, type: 'TIME' }));
    }

    dimensions.forEach((dimension) => {
      var expression = dimension.expression;
      if (expression.equals(timeAttribute)) return;
      var references = expression.getFreeReferences();
      for (var reference of references) {
        attributes.push(AttributeInfo.fromJS({ name: reference, type: 'STRING' }));
      }
    });

    measures.forEach((measure) => {
      var expression = measure.expression;
      var references = Measure.getAggregateReferences(expression);
      var countDistinctReferences = Measure.getCountDistinctReferences(expression);
      for (var reference of references) {
        if (countDistinctReferences.indexOf(reference) !== -1) {
          attributes.push(AttributeInfo.fromJS({ name: reference, special: 'unique' }));
        } else {
          attributes.push(AttributeInfo.fromJS({ name: reference, type: 'NUMBER' }));
        }
      }
    });

    if (attributeOverrides.length) {
      attributes = AttributeInfo.override(attributes, attributeOverrides);
    }

    return attributes;
  }

  public addAttributes(newAttributes: Attributes): DataSource {
    var { introspection, dimensions, measures, attributes } = this;
    if (introspection === 'none') return this;

    var autofillDimensions = introspection === 'autofill-dimensions-only' || introspection === 'autofill-all';
    var autofillMeasures = introspection === 'autofill-measures-only' || introspection === 'autofill-all';

    var $main = $('main');

    for (var newAttribute of newAttributes) {
      var { name, type, special } = newAttribute;

      // Already exists
      if (attributes && helper.findByName(attributes, name)) continue;

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
          if (special === 'unique') {
            if (!autofillMeasures) continue;

            var newMeasures = Measure.measuresFromAttributeInfo(newAttribute);
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

        case 'SET/STRING':
          if (!autofillDimensions) continue;
          expression = $(name);
          if (this.getDimensionByExpression(expression)) continue;
          dimensions = dimensions.push(new Dimension({
            name
          }));
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

          var newMeasures = Measure.measuresFromAttributeInfo(newAttribute);
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
    value.attributes = attributes ? AttributeInfo.override(attributes, newAttributes) : newAttributes;
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
