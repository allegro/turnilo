import * as Q from 'q';
import { List, OrderedSet } from 'immutable';
import { Class, Instance, isInstanceOf, immutableEqual, immutableArraysEqual, immutableLookupsEqual } from 'immutable-class';
import { Duration, Timezone, minute, second } from 'chronoshift';
import { $, ply, r, Expression, ExpressionJS, Executor, External, DruidExternal, RefExpression, basicExecutorFactory, Dataset, Datum,
  Attributes, AttributeInfo, AttributeJSs, ChainExpression, SortAction, SimpleFullType, DatasetFullType, PlyTypeSimple,
  CustomDruidAggregations, helper } from 'plywood';
import { hasOwnProperty, verifyUrlSafeName, makeUrlSafeName, makeTitle, immutableListsEqual } from '../../utils/general/general';
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
  rollup?: boolean;
  options?: DataSourceOptions;
  introspection: string;
  attributeOverrides: Attributes;
  attributes: Attributes;
  derivedAttributes?: Lookup<Expression>;

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

  external?: External;
  executor?: Executor;
}

export interface DataSourceJS {
  name: string;
  title?: string;
  engine: string;
  source: string;
  subsetFilter?: ExpressionJS;
  rollup?: boolean;
  options?: DataSourceOptions;
  introspection?: string;
  attributeOverrides?: AttributeJSs;
  attributes?: AttributeJSs;
  derivedAttributes?: Lookup<ExpressionJS>;
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

  longForm?: LongForm;
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

export interface DataSourceContext {
  executor?: Executor;
  external?: External;
}

export interface LongForm {
  metricColumn: string;
  possibleAggregates: Lookup<any>;
  addSubsetFilter?: boolean;
  titleNameTrim?: string;
  values: LongFormValue[];
}

export interface LongFormValue {
  value: string;
  aggregates: string[];
}

function measuresFromLongForm(longForm: LongForm): Measure[] {
  var { metricColumn, values, possibleAggregates, titleNameTrim } = longForm;
  var myPossibleAggregates: Lookup<Expression> = {};
  for (var agg in possibleAggregates) {
    if (!hasOwnProperty(possibleAggregates, agg)) continue;
    myPossibleAggregates[agg] = Expression.fromJSLoose(possibleAggregates[agg]);
  }

  var measures: Measure[] = [];
  for (var value of values) {
    var aggregates = value.aggregates;
    if (!Array.isArray(aggregates)) {
      throw new Error('must have aggregates in longForm value');
    }

    for (var aggregate of aggregates) {
      var myExpression = myPossibleAggregates[aggregate];
      if (!myExpression) throw new Error(`can not find aggregate ${aggregate} for value ${value.value}`);

      var name = makeUrlSafeName(`${aggregate}_${value.value}`);
      measures.push(new Measure({
        name,
        title: makeTitle(titleNameTrim ? name.replace(titleNameTrim, '') : name),
        expression: myExpression.substitute((ex) => {
          if (ex instanceof RefExpression && ex.name === 'filtered') {
            return $('main').filter($(metricColumn).is(r(value.value)));
          }
          return null;
        })
      }));
    }
  }

  return measures;
}

function filterFromLongFrom(longForm: LongForm): Expression {
  var { metricColumn, values } = longForm;
  return $(metricColumn).in(values.map(v => v.value));
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

  static fromJS(parameters: DataSourceJS, context: DataSourceContext = {}): DataSource {
    const { executor, external } = context;
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
    var derivedAttributes: Lookup<Expression> = null;
    if (parameters.derivedAttributes) {
      derivedAttributes = helper.expressionLookupFromJS(parameters.derivedAttributes);
    }

    var dimensions = makeUniqueDimensionList((parameters.dimensions || []).map((d) => Dimension.fromJS(d)));
    var measures = makeUniqueMeasureList((parameters.measures || []).map((m) => Measure.fromJS(m)));

    if (timeAttribute && !Dimension.getDimensionByExpression(dimensions, timeAttribute)) {
      dimensions = dimensions.unshift(new Dimension({
        name: timeAttributeName,
        expression: timeAttribute,
        kind: 'time'
      }));
    }

    var subsetFilter = parameters.subsetFilter ? Expression.fromJSLoose(parameters.subsetFilter) : null;

    var longForm = parameters.longForm;
    if (longForm) {
      measures = measures.concat(measuresFromLongForm(longForm)) as List<Measure>;

      if (longForm.addSubsetFilter) {
        if (!subsetFilter) subsetFilter = Expression.TRUE;
        subsetFilter = subsetFilter.and(filterFromLongFrom(longForm)).simplify();
      }
    }

    var value: DataSourceValue = {
      executor: null,
      name: parameters.name,
      title: parameters.title,
      engine,
      source: parameters.source,
      subsetFilter,
      rollup: parameters.rollup,
      options,
      introspection,
      attributeOverrides,
      attributes,
      derivedAttributes,
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
    if (external) value.external = external;
    if (executor) value.executor = executor;
    return new DataSource(value);
  }


  public name: string;
  public title: string;
  public engine: string;
  public source: string;
  public subsetFilter: Expression;
  public rollup: boolean;
  public options: DataSourceOptions;
  public introspection: string;
  public attributes: Attributes;
  public attributeOverrides: Attributes;
  public derivedAttributes: Lookup<Expression>;
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
  public external: External;

  constructor(parameters: DataSourceValue) {
    var name = parameters.name;
    verifyUrlSafeName(name);
    this.name = name;
    this.title = parameters.title || makeTitle(name);
    this.engine = parameters.engine || 'druid';
    this.source = parameters.source || name;
    this.subsetFilter = parameters.subsetFilter;
    this.rollup = Boolean(parameters.rollup);
    this.options = parameters.options || {};
    this.introspection = parameters.introspection || DataSource.DEFAULT_INTROSPECTION;
    this.attributes = parameters.attributes || [];
    this.attributeOverrides = parameters.attributeOverrides || [];
    this.derivedAttributes = parameters.derivedAttributes;
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
    this.external = parameters.external;

    this._validateDefaults();
  }

  public valueOf(): DataSourceValue {
    var value: DataSourceValue = {
      name: this.name,
      title: this.title,
      engine: this.engine,
      source: this.source,
      subsetFilter: this.subsetFilter,
      rollup: this.rollup,
      options: this.options,
      introspection: this.introspection,
      attributeOverrides: this.attributeOverrides,
      attributes: this.attributes,
      derivedAttributes: this.derivedAttributes,
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
    if (this.executor) value.executor = this.executor;
    if (this.external) value.external = this.external;
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
    if (this.rollup) js.rollup = true;
    if (this.timeAttribute) js.timeAttribute = this.timeAttribute.name;
    if (this.attributeOverrides.length) js.attributeOverrides = AttributeInfo.toJSs(this.attributeOverrides);
    if (this.attributes.length) js.attributes = AttributeInfo.toJSs(this.attributes);
    if (this.derivedAttributes) js.derivedAttributes = helper.expressionLookupToJS(this.derivedAttributes);
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
      immutableEqual(this.subsetFilter, other.subsetFilter) &&
      this.rollup === other.rollup &&
      JSON.stringify(this.options) === JSON.stringify(other.options) &&
      this.introspection === other.introspection &&
      immutableArraysEqual(this.attributeOverrides, other.attributeOverrides) &&
      immutableArraysEqual(this.attributes, other.attributes) &&
      immutableLookupsEqual(this.derivedAttributes, other.derivedAttributes) &&
      immutableListsEqual(this.dimensions, other.dimensions) &&
      immutableListsEqual(this.measures, other.measures) &&
      immutableEqual(this.timeAttribute, other.timeAttribute) &&
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

  public getMainTypeContext(): DatasetFullType { // ToDo: use external getFullType instead
    var { attributes, derivedAttributes } = this;
    if (!attributes) return null;

    var datasetType: Lookup<SimpleFullType> = {};
    for (var attribute of attributes) {
      datasetType[attribute.name] = (attribute as any);
    }

    for (var name in derivedAttributes) {
      datasetType[name] = {
        type: <PlyTypeSimple>derivedAttributes[name].type
      };
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

  public createExternal(requester: Requester.PlywoodRequester<any>, introspectionStrategy: string, timeout: number): DataSource {
    if (this.engine !== 'druid') return; // Only Druid supported for now.
    var value = this.valueOf();

    var context = {
      timeout
    };

    if (this.introspection === 'none') {
      value.external = new DruidExternal({
        suppress: true,
        dataSource: this.source,
        rollup: this.rollup,
        timeAttribute: this.timeAttribute.name,
        customAggregations: this.options.customAggregations,
        attributes: AttributeInfo.override(this.deduceAttributes(), this.attributeOverrides),
        derivedAttributes: this.derivedAttributes,
        introspectionStrategy,
        filter: this.subsetFilter,
        context,
        requester
      });
    } else {
      value.external = new DruidExternal({
        suppress: true,
        dataSource: this.source,
        rollup: this.rollup,
        timeAttribute: this.timeAttribute.name,
        attributeOverrides: this.attributeOverrides,
        derivedAttributes: this.derivedAttributes,
        customAggregations: this.options.customAggregations,
        introspectionStrategy,
        filter: this.subsetFilter,
        context,
        requester
      });
    }

    return new DataSource(value);
  }

  public introspect(): Q.Promise<DataSource> {
    var { external } = this;
    if (this.engine === 'native') return Q(this);
    if (!external) throw new Error(`must have external to introspect in ${this.name}`);

    var countDistinctReferences: string[] = [];
    if (this.measures) {
      countDistinctReferences = [].concat.apply([], this.measures.toArray().map((measure) => {
        return Measure.getCountDistinctReferences(measure.expression);
      }));
    }

    return external.introspect()
      .then((introspectedExternal) => {
        if (immutableArraysEqual(external.attributes, introspectedExternal.attributes)) return this;

        if (!countDistinctReferences) {
          var attributes = introspectedExternal.attributes;
          for (var attribute of attributes) {
            // This is a metric that should really be a HLL
            if (attribute.type === 'NUMBER' && countDistinctReferences.indexOf(attribute.name) !== -1) {
              introspectedExternal = introspectedExternal.updateAttribute(AttributeInfo.fromJS({
                name: attribute.name,
                special: 'unique'
              }));
            }
          }
        }

        var value = this.addAttributes(introspectedExternal.attributes).valueOf();
        value.external = introspectedExternal;
        value.executor = basicExecutorFactory({
          datasets: { main: introspectedExternal }
        });
        return new DataSource(value);
      });
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
      return 'Updated ~1 second ago';
    } else if (refreshRule.isFixed()) {
      return `Fixed to ${refreshRule.time.toISOString()}`;
    } else { // refreshRule is query
      var { maxTime } = this;
      if (maxTime) {
        return `Updated ${formatTimeDiff(Date.now() - maxTime.time.valueOf())} ago`;
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
    return Measure.getMeasure(this.measures, measureName);
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
        if (helper.findByName(attributes, reference)) continue;
        attributes.push(AttributeInfo.fromJS({ name: reference, type: 'STRING' }));
      }
    });

    measures.forEach((measure) => {
      var expression = measure.expression;
      var references = Measure.getAggregateReferences(expression);
      var countDistinctReferences = Measure.getCountDistinctReferences(expression);
      for (var reference of references) {
        if (helper.findByName(attributes, reference)) continue;
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
          throw new Error(`unsupported type ${type}`);
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
