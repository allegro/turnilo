/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Q from 'q';
import { List, OrderedSet } from 'immutable';
import { Class, Instance, isInstanceOf, immutableEqual, immutableArraysEqual, immutableLookupsEqual } from 'immutable-class';
import { Duration, Timezone, minute, second } from 'chronoshift';
import { $, ply, r, Expression, ExpressionJS, Executor, External, RefExpression, basicExecutorFactory, Dataset,
  Attributes, AttributeInfo, AttributeJSs, SortAction, SimpleFullType, DatasetFullType, PlyTypeSimple,
  CustomDruidAggregations, ExternalValue, helper } from 'plywood';
import { hasOwnProperty, verifyUrlSafeName, makeUrlSafeName, makeTitle, immutableListsEqual } from '../../utils/general/general';
import { getWallTimeString } from '../../utils/time/time';
import { Dimension, DimensionJS } from '../dimension/dimension';
import { Measure, MeasureJS } from '../measure/measure';
import { FilterClause } from '../filter-clause/filter-clause';
import { Filter, FilterJS } from '../filter/filter';
import { Splits, SplitsJS } from '../splits/splits';
import { MaxTime, MaxTimeJS } from '../max-time/max-time';
import { RefreshRule, RefreshRuleJS } from '../refresh-rule/refresh-rule';
import { Cluster } from '../cluster/cluster';

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

function checkUnique(dimensions: List<Dimension>, measures: List<Measure>, dataSourceName: string) {
  var seenDimensions: Lookup<number> = {};
  var seenMeasures: Lookup<number> = {};

  if (dimensions) {
    dimensions.forEach((d) => {
      var dimensionName = d.name.toLowerCase();
      if (seenDimensions[dimensionName]) throw new Error(`duplicate dimension name '${d.name}' found in data source: '${dataSourceName}'`);
      seenDimensions[dimensionName] = 1;
    });
  }

  if (measures) {
    measures.forEach((m) => {
      var measureName = m.name.toLowerCase();
      if (seenMeasures[measureName]) throw new Error(`duplicate measure name '${m.name}' found in data source: '${dataSourceName}'`);
      if (seenDimensions[measureName]) throw new Error(`name '${m.name}' found in both dimensions and measures in data source: '${dataSourceName}'`);
      seenMeasures[measureName] = 1;
    });
  }
}

export type Introspection = 'none' | 'no-autofill' | 'autofill-dimensions-only' | 'autofill-measures-only' | 'autofill-all';

export interface DataSourceValue {
  name: string;
  title?: string;
  description?: string;
  clusterName: string;
  source: string;
  group?: string;
  subsetFilter?: Expression;
  rollup?: boolean;
  options?: DataSourceOptions;
  introspection?: Introspection;
  attributeOverrides?: Attributes;
  attributes?: Attributes;
  derivedAttributes?: Lookup<Expression>;

  dimensions?: List<Dimension>;
  measures?: List<Measure>;
  timeAttribute?: RefExpression;
  defaultTimezone?: Timezone;
  defaultFilter?: Filter;
  defaultSplits?: Splits;
  defaultDuration?: Duration;
  defaultSortMeasure?: string;
  defaultSelectedMeasures?: OrderedSet<string>;
  defaultPinnedDimensions?: OrderedSet<string>;
  refreshRule?: RefreshRule;
  maxTime?: MaxTime;

  cluster?: Cluster;
  executor?: Executor;
}

export interface DataSourceJS {
  name: string;
  title?: string;
  description?: string;
  clusterName: string;
  source: string;
  group?: string;
  subsetFilter?: ExpressionJS;
  rollup?: boolean;
  options?: DataSourceOptions;
  introspection?: Introspection;
  attributeOverrides?: AttributeJSs;
  attributes?: AttributeJSs;
  derivedAttributes?: Lookup<ExpressionJS>;

  dimensions?: DimensionJS[];
  measures?: MeasureJS[];
  timeAttribute?: string;
  defaultTimezone?: string;
  defaultFilter?: FilterJS;
  defaultSplits?: SplitsJS;
  defaultDuration?: string;
  defaultSortMeasure?: string;
  defaultSelectedMeasures?: string[];
  defaultPinnedDimensions?: string[];
  refreshRule?: RefreshRuleJS;
  maxTime?: MaxTimeJS;

  longForm?: LongForm;
}

export interface DataSourceOptions {
  customAggregations?: CustomDruidAggregations;
  priority?: number;

  // Deprecated
  defaultSplits?: SplitsJS;
  defaultSplitDimension?: string;
  skipIntrospection?: boolean;
  disableAutofill?: boolean;
  attributeOverrides?: AttributeJSs;

  // Whatever
  [thing: string]: any;
}

export interface DataSourceContext {
  cluster?: Cluster;
  executor?: Executor;
}

export interface LongForm {
  metricColumn: string;
  possibleAggregates: Lookup<any>;
  addSubsetFilter?: boolean;
  values: LongFormValue[];
}

export interface LongFormValue {
  aggregates: string[];
  value: string;
  title: string;
}

function measuresFromLongForm(longForm: LongForm): Measure[] {
  const { metricColumn, values, possibleAggregates } = longForm;
  var myPossibleAggregates: Lookup<Expression> = {};
  for (var agg in possibleAggregates) {
    if (!hasOwnProperty(possibleAggregates, agg)) continue;
    myPossibleAggregates[agg] = Expression.fromJSLoose(possibleAggregates[agg]);
  }

  var measures: Measure[] = [];
  for (var value of values) {
    var title = value.title;
    if (!title) {
      throw new Error('must have title in longForm value');
    }

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
        title: title.replace(/%a/g, aggregate),
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

function filterFromLongForm(longForm: LongForm): Expression {
  var { metricColumn, values } = longForm;
  return $(metricColumn).in(values.map(v => v.value)).simplify();
}

var check: Class<DataSourceValue, DataSourceJS>;
export class DataSource implements Instance<DataSourceValue, DataSourceJS> {
  static DEFAULT_INTROSPECTION: Introspection = 'autofill-all';
  static INTROSPECTION_VALUES: Introspection[] = ['none', 'no-autofill', 'autofill-dimensions-only', 'autofill-measures-only', 'autofill-all'];
  static DEFAULT_DEFAULT_TIMEZONE = Timezone.UTC;
  static DEFAULT_DEFAULT_FILTER = Filter.EMPTY;
  static DEFAULT_DEFAULT_SPLITS = Splits.EMPTY;
  static DEFAULT_DEFAULT_DURATION = Duration.fromJS('P1D');

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

  static fromClusterAndExternal(name: string, cluster: Cluster, external: External): DataSource {
    var dataSource = DataSource.fromJS({
      name,
      clusterName: cluster.name,
      source: String(external.source),
      refreshRule: RefreshRule.query().toJS()
    });

    return dataSource.updateCluster(cluster).updateWithExternal(external);
  }

  static fromJS(parameters: DataSourceJS, context: DataSourceContext = {}): DataSource {
    const { cluster, executor } = context;
    var clusterName = parameters.clusterName;
    var introspection = parameters.introspection;
    var defaultSplitsJS = parameters.defaultSplits;
    var attributeOverrideJSs = parameters.attributeOverrides;

    // Back compat.
    if (!clusterName) {
      clusterName = (parameters as any).engine;
    }

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
    if (options.defaultSplits) {
      if (!defaultSplitsJS) defaultSplitsJS = options.defaultSplits;
      delete options.defaultSplits;
    }
    // End Back compat.

    if (introspection && DataSource.INTROSPECTION_VALUES.indexOf(introspection) === -1) {
      throw new Error(`invalid introspection value ${introspection}, must be one of ${DataSource.INTROSPECTION_VALUES.join(', ')}`);
    }

    var refreshRule = parameters.refreshRule ? RefreshRule.fromJS(parameters.refreshRule) : null;

    var maxTime = parameters.maxTime ? MaxTime.fromJS(parameters.maxTime) : null;

    var timeAttributeName = parameters.timeAttribute;
    if (cluster && cluster.type === 'druid' && !timeAttributeName) {
      timeAttributeName = '__time';
    }
    var timeAttribute = timeAttributeName ? $(timeAttributeName) : null;

    var attributeOverrides = AttributeInfo.fromJSs(attributeOverrideJSs || []);
    var attributes = AttributeInfo.fromJSs(parameters.attributes || []);
    var derivedAttributes: Lookup<Expression> = null;
    if (parameters.derivedAttributes) {
      derivedAttributes = helper.expressionLookupFromJS(parameters.derivedAttributes);
    }

    var dimensions = List((parameters.dimensions || []).map((d) => Dimension.fromJS(d)));
    var measures = List((parameters.measures || []).map((m) => Measure.fromJS(m)));

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
        subsetFilter = subsetFilter.and(filterFromLongForm(longForm)).simplify();
      }
    }

    var value: DataSourceValue = {
      executor: null,
      name: parameters.name,
      title: parameters.title,
      description: parameters.description,
      clusterName,
      source: parameters.source,
      group: parameters.group,
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
      defaultTimezone: parameters.defaultTimezone ? Timezone.fromJS(parameters.defaultTimezone) : null,
      defaultFilter: parameters.defaultFilter ? Filter.fromJS(parameters.defaultFilter) : null,
      defaultSplits: defaultSplitsJS ? Splits.fromJS(defaultSplitsJS, { dimensions }) : null,
      defaultDuration: parameters.defaultDuration ? Duration.fromJS(parameters.defaultDuration) : null,
      defaultSortMeasure: parameters.defaultSortMeasure || (measures.size ? measures.first().name : null),
      defaultSelectedMeasures: parameters.defaultSelectedMeasures ? OrderedSet(parameters.defaultSelectedMeasures) : null,
      defaultPinnedDimensions: parameters.defaultPinnedDimensions ? OrderedSet(parameters.defaultPinnedDimensions) : null,
      refreshRule,
      maxTime
    };
    if (cluster) {
      if (clusterName !== cluster.name) throw new Error(`Cluster name '${clusterName}' was given but '${cluster.name}' cluster was supplied (must match)`);
      value.cluster = cluster;
    }
    if (executor) value.executor = executor;
    return new DataSource(value);
  }


  public name: string;
  public title: string;
  public description: string;
  public clusterName: string;
  public source: string;
  public group: string;
  public subsetFilter: Expression;
  public rollup: boolean;
  public options: DataSourceOptions;
  public introspection: Introspection;
  public attributes: Attributes;
  public attributeOverrides: Attributes;
  public derivedAttributes: Lookup<Expression>;
  public dimensions: List<Dimension>;
  public measures: List<Measure>;
  public timeAttribute: RefExpression;
  public defaultTimezone: Timezone;
  public defaultFilter: Filter;
  public defaultSplits: Splits;
  public defaultDuration: Duration;
  public defaultSortMeasure: string;
  public defaultSelectedMeasures: OrderedSet<string>;
  public defaultPinnedDimensions: OrderedSet<string>;
  public refreshRule: RefreshRule;
  public maxTime: MaxTime;

  public cluster: Cluster;
  public executor: Executor;

  constructor(parameters: DataSourceValue) {
    var name = parameters.name;
    if (typeof name !== 'string') throw new Error(`DataSource must have a name`);
    verifyUrlSafeName(name);
    this.name = name;

    this.title = parameters.title || makeTitle(name);
    this.description = parameters.description || '';
    this.clusterName = parameters.clusterName || 'druid';
    this.source = parameters.source || name;
    this.group = parameters.group || null;
    this.subsetFilter = parameters.subsetFilter;
    this.rollup = Boolean(parameters.rollup);
    this.options = parameters.options || {};
    this.introspection = parameters.introspection;
    this.attributes = parameters.attributes || [];
    this.attributeOverrides = parameters.attributeOverrides || [];
    this.derivedAttributes = parameters.derivedAttributes;
    this.timeAttribute = parameters.timeAttribute;
    this.defaultTimezone = parameters.defaultTimezone;
    this.defaultFilter = parameters.defaultFilter;
    this.defaultSplits = parameters.defaultSplits;
    this.defaultDuration = parameters.defaultDuration;
    this.defaultSortMeasure = parameters.defaultSortMeasure;
    this.defaultSelectedMeasures = parameters.defaultSelectedMeasures;
    this.defaultPinnedDimensions = parameters.defaultPinnedDimensions;

    var refreshRule = parameters.refreshRule || RefreshRule.query();
    this.refreshRule = refreshRule;
    this.maxTime = parameters.maxTime || (refreshRule.isRealtime() ? MaxTime.fromNow() : null);

    this.cluster = parameters.cluster;
    this.executor = parameters.executor;

    var dimensions = parameters.dimensions;
    var measures = parameters.measures;
    checkUnique(dimensions, measures, name);

    this.dimensions = dimensions || List([]);
    this.measures = measures || List([]);

    this._validateDefaults();
  }

  public valueOf(): DataSourceValue {
    var value: DataSourceValue = {
      name: this.name,
      title: this.title,
      description: this.description,
      clusterName: this.clusterName,
      source: this.source,
      group: this.group,
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
      defaultSplits: this.defaultSplits,
      defaultDuration: this.defaultDuration,
      defaultSortMeasure: this.defaultSortMeasure,
      defaultSelectedMeasures: this.defaultSelectedMeasures,
      defaultPinnedDimensions: this.defaultPinnedDimensions,
      refreshRule: this.refreshRule,
      maxTime: this.maxTime
    };
    if (this.cluster) value.cluster = this.cluster;
    if (this.executor) value.executor = this.executor;
    return value;
  }

  public toJS(): DataSourceJS {
    var js: DataSourceJS = {
      name: this.name,
      title: this.title,
      description: this.description,
      clusterName: this.clusterName,
      source: this.source,
      subsetFilter: this.subsetFilter ? this.subsetFilter.toJS() : null,
      dimensions: this.dimensions.toArray().map(dimension => dimension.toJS()),
      measures: this.measures.toArray().map(measure => measure.toJS()),
      refreshRule: this.refreshRule.toJS()
    };
    if (this.group) js.group = this.group;
    if (this.introspection) js.introspection = this.introspection;
    if (this.defaultTimezone) js.defaultTimezone = this.defaultTimezone.toJS();
    if (this.defaultFilter) js.defaultFilter = this.defaultFilter.toJS();
    if (this.defaultSplits) js.defaultSplits = this.defaultSplits.toJS();
    if (this.defaultDuration) js.defaultDuration = this.defaultDuration.toJS();
    if (this.defaultSortMeasure) js.defaultSortMeasure = this.defaultSortMeasure;
    if (this.defaultSelectedMeasures) js.defaultSelectedMeasures = this.defaultSelectedMeasures.toArray();
    if (this.defaultPinnedDimensions) js.defaultPinnedDimensions = this.defaultPinnedDimensions.toArray();
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
      this.description === other.description &&
      this.clusterName === other.clusterName &&
      this.source === other.source &&
      this.group === other.group &&
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
      immutableEqual(this.defaultTimezone, other.defaultTimezone) &&
      immutableEqual(this.defaultFilter, other.defaultFilter) &&
      immutableEqual(this.defaultSplits, other.defaultSplits) &&
      immutableEqual(this.defaultDuration, other.defaultDuration) &&
      this.defaultSortMeasure === other.defaultSortMeasure &&
      Boolean(this.defaultSelectedMeasures) === Boolean(other.defaultSelectedMeasures) &&
      (!this.defaultSelectedMeasures || this.defaultSelectedMeasures.equals(other.defaultSelectedMeasures)) &&
      Boolean(this.defaultPinnedDimensions) === Boolean(other.defaultPinnedDimensions) &&
      (!this.defaultPinnedDimensions || this.defaultPinnedDimensions.equals(other.defaultPinnedDimensions)) &&
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

  public toExternal(): External {
    if (this.clusterName === 'native') throw new Error(`there is no external on a native data source`);
    const { cluster, options } = this;
    if (!cluster) throw new Error('must have a cluster');

    var externalValue: ExternalValue = {
      engine: cluster.type,
      suppress: true,
      source: this.source,
      version: cluster.version,
      derivedAttributes: this.derivedAttributes,
      customAggregations: options.customAggregations,
      filter: this.subsetFilter
    };

    if (cluster.type === 'druid') {
      externalValue.rollup = this.rollup;
      externalValue.timeAttribute = this.timeAttribute.name;
      externalValue.introspectionStrategy = cluster.getIntrospectionStrategy();
      externalValue.allowSelectQueries = true;

      var externalContext: Lookup<any> = {
        timeout: cluster.getTimeout()
      };
      if (options.priority) externalContext['priority'] = options.priority;
      externalValue.context = externalContext;
    }

    if (this.introspection === 'none') {
      externalValue.attributes = AttributeInfo.override(this.deduceAttributes(), this.attributeOverrides);
      externalValue.derivedAttributes = this.derivedAttributes;
    } else {
      // ToDo: else if (we know that it will GET introspect) and there are no overrides apply special attributes as overrides
      externalValue.attributeOverrides = this.attributeOverrides;
    }

    return External.fromValue(externalValue);
  }

  public getMainTypeContext(): DatasetFullType {
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

  public updateCluster(cluster: Cluster): DataSource {
    var value = this.valueOf();
    value.cluster = cluster;
    return new DataSource(value);
  }

  public updateWithDataset(dataset: Dataset): DataSource {
    if (this.clusterName !== 'native') throw new Error('must be native to have a dataset');

    var executor = basicExecutorFactory({
      datasets: { main: dataset }
    });

    return this.addAttributes(dataset.attributes).attachExecutor(executor);
  }

  public updateWithExternal(external: External): DataSource {
    if (this.clusterName === 'native') throw new Error('can not be native and have an external');

    var executor = basicExecutorFactory({
      datasets: { main: external }
    });

    return this.addAttributes(external.attributes).attachExecutor(executor);
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

    // No need for any introspection information on the client
    value.introspection = null;

    // No point sending over the maxTime
    if (this.refreshRule.isRealtime()) {
      value.maxTime = null;
    }

    // No need for the overrides
    value.attributeOverrides = null;

    value.options = null;

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

  public updatedText(timezone: Timezone): string {
    var { refreshRule } = this;
    if (refreshRule.isRealtime()) {
      return 'Updated ~1 second ago';
    } else if (refreshRule.isFixed()) {
      return `Fixed to ${getWallTimeString(refreshRule.time, timezone, true)}`;
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
    return this.clusterName === 'druid';
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
    var { dimensions, measures, attributes } = this;
    const introspection = this.getIntrospection();
    if (introspection === 'none') return this;

    var autofillDimensions = introspection === 'autofill-dimensions-only' || introspection === 'autofill-all';
    var autofillMeasures = introspection === 'autofill-measures-only' || introspection === 'autofill-all';

    var $main = $('main');

    for (var newAttribute of newAttributes) {
      var { name, type, special } = newAttribute;

      // Already exists as a current attribute
      if (attributes && helper.findByName(attributes, name)) continue;

      // Already exists as a current dimension or a measure
      var urlSafeName = makeUrlSafeName(name);
      if (this.getDimension(urlSafeName) || this.getMeasure(urlSafeName)) continue;

      var expression: Expression;
      switch (type) {
        case 'TIME':
          if (!autofillDimensions) continue;
          expression = $(name);
          if (this.getDimensionByExpression(expression)) continue;
          // Add to the start
          dimensions = dimensions.unshift(new Dimension({
            name: urlSafeName,
            kind: 'time',
            expression
          }));
          break;

        case 'STRING':
          if (special === 'unique' || special === 'theta') {
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
              name: urlSafeName,
              expression
            }));
          }
          break;

        case 'SET/STRING':
          if (!autofillDimensions) continue;
          expression = $(name);
          if (this.getDimensionByExpression(expression)) continue;
          dimensions = dimensions.push(new Dimension({
            name: urlSafeName,
            expression
          }));
          break;

        case 'BOOLEAN':
          if (!autofillDimensions) continue;
          expression = $(name);
          if (this.getDimensionByExpression(expression)) continue;
          dimensions = dimensions.push(new Dimension({
            name: urlSafeName,
            kind: 'boolean',
            expression
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

    if (!value.timeAttribute && dimensions.size && dimensions.first().kind === 'time') {
      value.timeAttribute = <RefExpression>dimensions.first().expression;
    }

    return new DataSource(value);
  }

  public getIntrospection(): Introspection {
    return this.introspection || DataSource.DEFAULT_INTROSPECTION;
  }

  public getDefaultTimezone(): Timezone {
    return this.defaultTimezone || DataSource.DEFAULT_DEFAULT_TIMEZONE;
  }

  public getDefaultFilter(): Filter {
    var filter = this.defaultFilter || DataSource.DEFAULT_DEFAULT_FILTER;
    if (this.timeAttribute) {
      filter = filter.setSelection(
        this.timeAttribute,
        $(FilterClause.MAX_TIME_REF_NAME).timeRange(this.getDefaultDuration(), -1)
      );
    }
    return filter;
  }

  public getDefaultSplits(): Splits {
    return this.defaultSplits || DataSource.DEFAULT_DEFAULT_SPLITS;
  }

  public getDefaultDuration(): Duration {
    return this.defaultDuration || DataSource.DEFAULT_DEFAULT_DURATION;
  }

  public getDefaultSortMeasure(): string {
    return this.defaultSortMeasure || this.measures.first().name;
  }

  public getDefaultSelectedMeasures(): OrderedSet<string> {
    return this.defaultSelectedMeasures || (OrderedSet(this.measures.slice(0, 4).map(m => m.name)) as any);
  }

  public getDefaultPinnedDimensions(): OrderedSet<string> {
    return this.defaultPinnedDimensions || (OrderedSet([]) as any);
  }

  change(propertyName: string, newValue: any): DataSource {
    var v = this.valueOf();

    if (!v.hasOwnProperty(propertyName)) {
      throw new Error(`Unknown property : ${propertyName}`);
    }

    (v as any)[propertyName] = newValue;
    return new DataSource(v);
  }

  public changeMaxTime(maxTime: MaxTime) {
    return this.change('maxTime', maxTime);
  }

  public changeTitle(title: string) {
    return this.change('title', title);
  }

  public changeDescription(description: string) {
    return this.change('description', description);
  }

  public changeMeasures(measures: List<Measure>) {
    return this.change('measures', measures);
  }

  public getDefaultSortAction(): SortAction {
    return new SortAction({
      expression: $(this.defaultSortMeasure),
      direction: SortAction.DESCENDING
    });
  }

  public sameGroup(otherDataSource: DataSource): boolean {
    return Boolean(this.group && this.group === otherDataSource.group);
  }
}
check = DataSource;
