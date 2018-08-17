/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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

import { Duration, Timezone } from "chronoshift";
import { List, OrderedSet } from "immutable";
import { Class, immutableArraysEqual, immutableEqual, immutableLookupsEqual, Instance, NamedArray } from "immutable-class";
import {
  $,
  AttributeInfo,
  AttributeJSs,
  Attributes,
  basicExecutorFactory,
  CustomDruidAggregations,
  CustomDruidTransforms,
  Dataset,
  DatasetFullType,
  Executor,
  Expression,
  ExpressionJS,
  External,
  ExternalValue,
  ply,
  PlyTypeSimple,
  r,
  RefExpression,
  SimpleFullType,
  SortExpression
} from "plywood";
import { hasOwnProperty, makeUrlSafeName, quoteNames, verifyUrlSafeName } from "../../utils/general/general";
import { getWallTimeString } from "../../utils/time/time";
import { Cluster } from "../cluster/cluster";
import { Dimension } from "../dimension/dimension";
import { DimensionOrGroupJS } from "../dimension/dimension-group";
import { Dimensions } from "../dimension/dimensions";
import { FilterClause } from "../filter-clause/filter-clause";
import { Filter, FilterJS } from "../filter/filter";
import { Measure, MeasureJS } from "../measure/measure";
import { MeasureOrGroupJS } from "../measure/measure-group";
import { Measures } from "../measure/measures";
import { RefreshRule, RefreshRuleJS } from "../refresh-rule/refresh-rule";
import { Splits, SplitsJS } from "../splits/splits";
import { Timekeeper } from "../timekeeper/timekeeper";

function formatTimeDiff(diff: number): string {
  diff = Math.round(Math.abs(diff) / 1000); // turn to seconds
  if (diff < 60) return "less than 1 minute";

  diff = Math.floor(diff / 60); // turn to minutes
  if (diff === 1) return "1 minute";
  if (diff < 60) return diff + " minutes";

  diff = Math.floor(diff / 60); // turn to hours
  if (diff === 1) return "1 hour";
  if (diff <= 24) return diff + " hours";

  diff = Math.floor(diff / 24); // turn to days
  return diff + " days";
}

function checkDimensionsAndMeasuresNamesUniqueness(dimensions: Dimensions, measures: Measures, dataCubeName: string) {
  if (dimensions != null && measures != null) {
    const dimensionNames = dimensions.getDimensionNames();
    const measureNames = measures.getMeasureNames();

    const duplicateNames = dimensionNames
      .concat(measureNames)
      .groupBy(name => name)
      .filter(names => names.size > 1)
      .map((names, name) => name)
      .toList();

    if (duplicateNames.size > 0) {
      throw new Error(`data cube: '${dataCubeName}', names: ${quoteNames(duplicateNames)} found in both dimensions and measures'`);
    }
  }
}

export type Introspection = "none" | "no-autofill" | "autofill-dimensions-only" | "autofill-measures-only" | "autofill-all";

export interface DataCubeValue {
  name: string;
  title?: string;
  description?: string;
  extendedDescription?: string;
  clusterName: string;
  source: string;
  group?: string;
  subsetFormula?: string;
  rollup?: boolean;
  options?: DataCubeOptions;
  introspection?: Introspection;
  attributeOverrides?: Attributes;
  attributes?: Attributes;
  derivedAttributes?: Record<string, Expression>;

  dimensions?: Dimensions;
  measures?: Measures;
  timeAttribute?: RefExpression;
  defaultTimezone?: Timezone;
  defaultFilter?: Filter;
  defaultSplits?: Splits;
  defaultDuration?: Duration;
  defaultSortMeasure?: string;
  defaultSelectedMeasures?: OrderedSet<string>;
  defaultPinnedDimensions?: OrderedSet<string>;
  refreshRule?: RefreshRule;

  cluster?: Cluster;
  executor?: Executor;
}

export interface DataCubeJS {
  name: string;
  title?: string;
  description?: string;
  extendedDescription?: string;
  clusterName: string;
  source: string;
  group?: string;
  subsetFormula?: string;
  rollup?: boolean;
  options?: DataCubeOptions;
  introspection?: Introspection;
  attributeOverrides?: AttributeJSs;
  attributes?: AttributeJSs;
  derivedAttributes?: Record<string, ExpressionJS>;

  dimensions?: DimensionOrGroupJS[];
  measures?: MeasureOrGroupJS[];
  timeAttribute?: string;
  defaultTimezone?: string;
  defaultFilter?: FilterJS;
  defaultSplits?: SplitsJS;
  defaultDuration?: string;
  defaultSortMeasure?: string;
  defaultSelectedMeasures?: string[];
  defaultPinnedDimensions?: string[];
  refreshRule?: RefreshRuleJS;
}

export interface DataCubeOptions {
  customAggregations?: CustomDruidAggregations;
  customTransforms?: CustomDruidTransforms;
  druidContext?: Record<string, any>;

  // Deprecated
  defaultSplits?: SplitsJS;
  defaultSplitDimension?: string;
  skipIntrospection?: boolean;
  disableAutofill?: boolean;
  attributeOverrides?: AttributeJSs;

  // Whatever
  [thing: string]: any;
}

export interface DataCubeContext {
  cluster?: Cluster;
  executor?: Executor;
}

export interface LongForm {
  metricColumn: string;
  possibleAggregates: Record<string, any>;
  addSubsetFilter?: boolean;
  measures: Array<MeasureJS | LongFormMeasure>;
}

export interface LongFormMeasure {
  aggregate: string;
  value: string;
  title: string;
  units?: string;
}

function measuresFromLongForm(longForm: LongForm): Measure[] {
  const { metricColumn, measures, possibleAggregates } = longForm;
  let myPossibleAggregates: Record<string, Expression> = {};
  for (let agg in possibleAggregates) {
    if (!hasOwnProperty(possibleAggregates, agg)) continue;
    myPossibleAggregates[agg] = Expression.fromJSLoose(possibleAggregates[agg]);
  }

  return measures.map(measure => {
    if (hasOwnProperty(measure, "name")) {
      return Measure.fromJS(measure as MeasureJS);
    }

    const title = measure.title;
    if (!title) {
      throw new Error("must have title in longForm value");
    }

    const value = (measure as LongFormMeasure).value;
    const aggregate = (measure as LongFormMeasure).aggregate;
    if (!aggregate) {
      throw new Error("must have aggregates in longForm value");
    }

    const myExpression = myPossibleAggregates[aggregate];
    if (!myExpression) throw new Error(`can not find aggregate ${aggregate} for value ${value}`);

    const name = makeUrlSafeName(`${aggregate}_${value}`);
    return new Measure({
      name,
      title,
      units: measure.units,
      formula: myExpression.substitute(ex => {
        if (ex instanceof RefExpression && ex.name === "filtered") {
          return $("main").filter($(metricColumn).is(r(value)));
        }
        return null;
      }).toString()
    });
  });
}

function filterFromLongForm(longForm: LongForm): Expression {
  const { metricColumn, measures } = longForm;
  let values: string[] = [];
  for (let measure of measures) {
    if (hasOwnProperty(measure, "aggregate")) values.push((measure as LongFormMeasure).value);
  }
  return $(metricColumn).in(values).simplify();
}

let check: Class<DataCubeValue, DataCubeJS>;

export class DataCube implements Instance<DataCubeValue, DataCubeJS> {
  static DEFAULT_INTROSPECTION: Introspection = "autofill-all";
  static INTROSPECTION_VALUES: Introspection[] = ["none", "no-autofill", "autofill-dimensions-only", "autofill-measures-only", "autofill-all"];
  static DEFAULT_DEFAULT_TIMEZONE = Timezone.UTC;
  static DEFAULT_DEFAULT_FILTER = Filter.EMPTY;
  static DEFAULT_DEFAULT_SPLITS = Splits.EMPTY;
  static DEFAULT_DEFAULT_DURATION = Duration.fromJS("P1D");

  static isDataCube(candidate: any): candidate is DataCube {
    return candidate instanceof DataCube;
  }

  static queryMaxTime(dataCube: DataCube): Promise<Date> {
    if (!dataCube.executor) {
      return Promise.reject(new Error("dataCube not ready"));
    }

    const ex = ply().apply("maxTime", $("main").max(dataCube.timeAttribute));

    return dataCube.executor(ex).then((dataset: Dataset) => {
      const maxTimeDate = <Date> dataset.data[0]["maxTime"];
      if (isNaN(maxTimeDate as any)) return null;
      return maxTimeDate;
    });
  }

  static fromClusterAndExternal(name: string, cluster: Cluster, external: External): DataCube {
    const dataCube = DataCube.fromJS({
      name,
      clusterName: cluster.name,
      source: String(external.source),
      refreshRule: RefreshRule.query().toJS()
    });

    return dataCube.updateCluster(cluster).updateWithExternal(external);
  }

  static fromJS(parameters: DataCubeJS, context: DataCubeContext = {}): DataCube {
    const { cluster, executor } = context;
    if (!parameters.name) throw new Error("DataCube must have a name");

    let clusterName = parameters.clusterName;
    let introspection = parameters.introspection;
    let defaultSplitsJS = parameters.defaultSplits;
    let attributeOverrideJSs = parameters.attributeOverrides;

    // Back compat.
    if (!clusterName) {
      clusterName = (parameters as any).engine;
    }

    let options = parameters.options || {};
    if (options.skipIntrospection) {
      if (!introspection) introspection = "none";
      delete options.skipIntrospection;
    }
    if (options.disableAutofill) {
      if (!introspection) introspection = "no-autofill";
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

    if (introspection && DataCube.INTROSPECTION_VALUES.indexOf(introspection) === -1) {
      throw new Error(`invalid introspection value ${introspection}, must be one of ${DataCube.INTROSPECTION_VALUES.join(", ")}`);
    }

    const refreshRule = parameters.refreshRule ? RefreshRule.fromJS(parameters.refreshRule) : null;

    let timeAttributeName = parameters.timeAttribute;
    if (cluster && cluster.type === "druid" && !timeAttributeName) {
      timeAttributeName = "__time";
    }
    const timeAttribute = timeAttributeName ? $(timeAttributeName) : null;

    const attributeOverrides = AttributeInfo.fromJSs(attributeOverrideJSs || []);
    const attributes = AttributeInfo.fromJSs(parameters.attributes || []);
    let derivedAttributes: Record<string, Expression> = null;
    if (parameters.derivedAttributes) {
      derivedAttributes = Expression.expressionLookupFromJS(parameters.derivedAttributes);
    }

    let dimensions: Dimensions;
    let measures: Measures;
    try {
      dimensions = Dimensions.fromJS(parameters.dimensions || []);
      measures = Measures.fromJS(parameters.measures || []);

      if (timeAttribute && !dimensions.getDimensionByExpression(timeAttribute)) {
        dimensions = dimensions.prepend(new Dimension({
          name: timeAttributeName,
          kind: "time",
          formula: timeAttribute.toString()
        }));
      }
    } catch (e) {
      e.message = `data cube: '${parameters.name}', ${e.message}`;
      throw e;
    }

    const subsetFormula = parameters.subsetFormula || (parameters as any).subsetFilter;

    let value: DataCubeValue = {
      executor: null,
      name: parameters.name,
      title: parameters.title,
      description: parameters.description,
      extendedDescription: parameters.extendedDescription,
      clusterName,
      source: parameters.source,
      group: parameters.group,
      subsetFormula,
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
      defaultSortMeasure: parameters.defaultSortMeasure || (measures.size() ? measures.first().name : null),
      defaultSelectedMeasures: parameters.defaultSelectedMeasures ? OrderedSet(parameters.defaultSelectedMeasures) : null,
      defaultPinnedDimensions: parameters.defaultPinnedDimensions ? OrderedSet(parameters.defaultPinnedDimensions) : null,
      refreshRule
    };
    if (cluster) {
      if (clusterName !== cluster.name) throw new Error(`Cluster name '${clusterName}' was given but '${cluster.name}' cluster was supplied (must match)`);
      value.cluster = cluster;
    }
    if (executor) value.executor = executor;
    return new DataCube(value);
  }

  public name: string;
  public title: string;
  public description: string;
  public extendedDescription: string;
  public clusterName: string;
  public source: string;
  public group: string;
  public subsetFormula: string;
  public subsetExpression: Expression;
  public rollup: boolean;
  public options: DataCubeOptions;
  public introspection: Introspection;
  public attributes: Attributes;
  public attributeOverrides: Attributes;
  public derivedAttributes: Record<string, Expression>;
  public dimensions: Dimensions;
  public measures: Measures;
  public timeAttribute: RefExpression;
  public defaultTimezone: Timezone;
  public defaultFilter: Filter;
  public defaultSplits: Splits;
  public defaultDuration: Duration;
  public defaultSortMeasure: string;
  public defaultSelectedMeasures: OrderedSet<string>;
  public defaultPinnedDimensions: OrderedSet<string>;
  public refreshRule: RefreshRule;

  public cluster: Cluster;
  public executor: Executor;

  constructor(parameters: DataCubeValue) {
    const name = parameters.name;
    if (!parameters.name) throw new Error("DataCube must have a name");
    verifyUrlSafeName(name);
    this.name = name;

    this.title = parameters.title ? parameters.title : parameters.name;
    this.clusterName = parameters.clusterName || "druid";
    this.source = parameters.source || name;
    this.group = parameters.group || null;
    this.subsetFormula = parameters.subsetFormula;
    this.subsetExpression = parameters.subsetFormula ? Expression.fromJSLoose(parameters.subsetFormula) : Expression.TRUE;
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

    const { description, extendedDescription } = this.parseDescription(parameters);
    this.description = description;
    this.extendedDescription = extendedDescription;

    this.refreshRule = parameters.refreshRule || RefreshRule.query();

    this.cluster = parameters.cluster;
    this.executor = parameters.executor;

    const dimensions = parameters.dimensions;
    const measures = parameters.measures;
    checkDimensionsAndMeasuresNamesUniqueness(dimensions, measures, name);

    this.dimensions = dimensions || Dimensions.empty();
    this.measures = measures || Measures.empty();

    this._validateDefaults();
  }

  public valueOf(): DataCubeValue {
    let value: DataCubeValue = {
      name: this.name,
      title: this.title,
      description: this.description,
      extendedDescription: this.extendedDescription,
      clusterName: this.clusterName,
      source: this.source,
      group: this.group,
      subsetFormula: this.subsetFormula,
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
      refreshRule: this.refreshRule
    };
    if (this.cluster) value.cluster = this.cluster;
    if (this.executor) value.executor = this.executor;
    return value;
  }

  public toJS(): DataCubeJS {
    let js: DataCubeJS = {
      name: this.name,
      title: this.title,
      description: this.description,
      clusterName: this.clusterName,
      source: this.source,
      dimensions: this.dimensions.toJS(),
      measures: this.measures.toJS(),
      refreshRule: this.refreshRule.toJS()
    };
    if (this.extendedDescription) js.extendedDescription = this.extendedDescription;
    if (this.group) js.group = this.group;
    if (this.introspection) js.introspection = this.introspection;
    if (this.subsetFormula) js.subsetFormula = this.subsetFormula;
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
    if (this.derivedAttributes) js.derivedAttributes = Expression.expressionLookupToJS(this.derivedAttributes);
    if (Object.keys(this.options).length) js.options = this.options;
    return js;
  }

  public toJSON(): DataCubeJS {
    return this.toJS();
  }

  public toString(): string {
    return `[DataCube: ${this.name}]`;
  }

  public equals(other: DataCube): boolean {
    return DataCube.isDataCube(other) &&
      this.name === other.name &&
      this.title === other.title &&
      this.description === other.description &&
      this.extendedDescription === other.extendedDescription &&
      this.clusterName === other.clusterName &&
      this.source === other.source &&
      this.group === other.group &&
      this.subsetFormula === other.subsetFormula &&
      this.rollup === other.rollup &&
      JSON.stringify(this.options) === JSON.stringify(other.options) &&
      this.introspection === other.introspection &&
      immutableArraysEqual(this.attributeOverrides, other.attributeOverrides) &&
      immutableArraysEqual(this.attributes, other.attributes) &&
      immutableLookupsEqual(this.derivedAttributes, other.derivedAttributes) &&
      this.dimensions.equals(other.dimensions) &&
      this.measures.equals(other.measures) &&
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

  private parseDescription({ description, extendedDescription }: DataCubeValue): { description: string, extendedDescription?: string } {
    if (!description) {
      return { description: "" };
    }
    if (extendedDescription) {
      return { description, extendedDescription };
    }
    const segments = description.split(/\n---\n/);
    if (segments.length === 0) {
      return { description };
    }
    return {
      description: segments[0],
      extendedDescription: segments.splice(1).join("\n---\n ")
    };
  }

  private _validateDefaults() {
    const { measures, defaultSortMeasure } = this;

    if (defaultSortMeasure) {
      if (!measures.containsMeasureWithName(defaultSortMeasure)) {
        throw new Error(`can not find defaultSortMeasure '${defaultSortMeasure}' in data cube '${this.name}'`);
      }
    }
  }

  public toExternal(): External {
    if (this.clusterName === "native") throw new Error("there is no external on a native data cube");
    const { cluster, options } = this;
    if (!cluster) throw new Error("must have a cluster");

    let externalValue: ExternalValue = {
      engine: cluster.type,
      suppress: true,
      source: this.source,
      version: cluster.version,
      derivedAttributes: this.derivedAttributes,
      customAggregations: options.customAggregations,
      customTransforms: options.customTransforms,
      filter: this.subsetExpression
    };

    if (cluster.type === "druid") {
      externalValue.rollup = this.rollup;
      externalValue.timeAttribute = this.timeAttribute.name;
      externalValue.introspectionStrategy = cluster.getIntrospectionStrategy();
      externalValue.allowSelectQueries = true;

      let externalContext: Record<string, any> = options.druidContext || {};
      externalContext["timeout"] = cluster.getTimeout();
      externalValue.context = externalContext;
    }

    if (this.introspection === "none") {
      externalValue.attributes = AttributeInfo.override(this.deduceAttributes(), this.attributeOverrides);
      externalValue.derivedAttributes = this.derivedAttributes;
    } else {
      // ToDo: else if (we know that it will GET introspect) and there are no overrides apply special attributes as overrides
      externalValue.attributeOverrides = this.attributeOverrides;
    }

    return External.fromValue(externalValue);
  }

  public getMainTypeContext(): DatasetFullType {
    const { attributes, derivedAttributes } = this;
    if (!attributes) return null;

    let datasetType: Record<string, SimpleFullType> = {};
    for (let attribute of attributes) {
      datasetType[attribute.name] = (attribute as any);
    }

    for (let name in derivedAttributes) {
      datasetType[name] = {
        type: <PlyTypeSimple> derivedAttributes[name].type
      };
    }

    return {
      type: "DATASET",
      datasetType
    };
  }

  public getIssues(): string[] {
    const { dimensions, measures } = this;
    const mainTypeContext = this.getMainTypeContext();
    let issues: string[] = [];

    dimensions.forEachDimension(dimension => {
      try {
        dimension.expression.changeInTypeContext(mainTypeContext);
      } catch (e) {
        issues.push(`failed to validate dimension '${dimension.name}': ${e.message}`);
      }
    });

    const measureTypeContext: DatasetFullType = {
      type: "DATASET",
      datasetType: {
        main: mainTypeContext
      }
    };

    measures.forEachMeasure(measure => {
      try {
        measure.expression.changeInTypeContext(measureTypeContext);
      } catch (e) {
        let message = e.message;
        // If we get here it is possible that the user has misunderstood what the meaning of a measure is and have tried
        // to do something like $volume / $volume. We detect this here by checking for a reference to $main
        // If there is no main reference raise a more informative issue.
        if (measure.expression.getFreeReferences().indexOf("main") === -1) {
          message = "measure must contain a $main reference";
        }
        issues.push(`failed to validate measure '${measure.name}': ${message}`);
      }
    });

    return issues;
  }

  public updateCluster(cluster: Cluster): DataCube {
    let value = this.valueOf();
    value.cluster = cluster;
    return new DataCube(value);
  }

  public updateWithDataset(dataset: Dataset): DataCube {
    if (this.clusterName !== "native") throw new Error("must be native to have a dataset");

    const executor = basicExecutorFactory({
      datasets: { main: dataset }
    });

    return this.addAttributes(dataset.attributes).attachExecutor(executor);
  }

  public updateWithExternal(external: External): DataCube {
    if (this.clusterName === "native") throw new Error("can not be native and have an external");

    const executor = basicExecutorFactory({
      datasets: { main: external }
    });

    return this.addAttributes(external.attributes).attachExecutor(executor);
  }

  public attachExecutor(executor: Executor): DataCube {
    let value = this.valueOf();
    value.executor = executor;
    return new DataCube(value);
  }

  public toClientDataCube(): DataCube {
    let value = this.valueOf();

    // Do not reveal the subset filter to the client
    value.subsetFormula = null;

    // No need for any introspection information on the client
    value.introspection = null;

    // No need for the overrides
    value.attributeOverrides = null;

    value.options = null;

    return new DataCube(value);
  }

  public isQueryable(): boolean {
    return Boolean(this.executor);
  }

  public getMaxTime(timekeeper: Timekeeper): Date {
    const { name, refreshRule } = this;
    if (refreshRule.isRealtime()) {
      return timekeeper.now();
    } else if (refreshRule.isFixed()) {
      return refreshRule.time;
    } else { // refreshRule is query
      return timekeeper.getTime(name);
    }
  }

  public updatedText(timekeeper: Timekeeper, timezone: Timezone): string {
    const { refreshRule } = this;
    if (refreshRule.isRealtime()) {
      return "Updated ~1 second ago";
    } else if (refreshRule.isFixed()) {
      return `Fixed to ${getWallTimeString(refreshRule.time, timezone)}`;
    } else { // refreshRule is query
      const maxTime = this.getMaxTime(timekeeper);
      if (maxTime) {
        return `Updated ${formatTimeDiff(timekeeper.now().valueOf() - maxTime.valueOf().valueOf())} ago`;
      } else {
        return null;
      }
    }
  }

  public getDimension(dimensionName: string): Dimension {
    return this.dimensions.getDimensionByName(dimensionName);
  }

  public getDimensionByExpression(expression: Expression): Dimension {
    return this.dimensions.getDimensionByExpression(expression);
  }

  public getDimensionsByKind(kind: string): Dimension[] {
    return this.dimensions.filterDimensions(dimension => dimension.kind === kind);
  }

  public getSuggestedDimensions(): Dimension[] {
    // TODO: actually implement this
    return [];
  }

  public getTimeDimension() {
    return this.getDimensionByExpression(this.timeAttribute);
  }

  public isTimeAttribute(ex: Expression) {
    return ex.equals(this.timeAttribute);
  }

  public getMeasure(measureName: string): Measure {
    return this.measures.getMeasureByName(measureName);
  }

  public getSuggestedMeasures(): Measure[] {
    // TODO: actually implement this
    return [];
  }

  public changeDimensions(dimensions: Dimensions): DataCube {
    let value = this.valueOf();
    value.dimensions = dimensions;
    return new DataCube(value);
  }

  public rolledUp(): boolean {
    return this.clusterName === "druid";
  }

  /**
   * This function tries to deduce the structure of the dataCube based on the dimensions and measures defined within.
   * It should only be used when, for some reason, introspection if not available.
   */
  public deduceAttributes(): Attributes {
    const { dimensions, measures, timeAttribute, attributeOverrides } = this;
    let attributes: Attributes = [];

    if (timeAttribute) {
      attributes.push(AttributeInfo.fromJS({ name: timeAttribute.name, type: "TIME" }));
    }

    dimensions.forEachDimension(dimension => {
      const expression = dimension.expression;
      if (expression.equals(timeAttribute)) return;
      const references = expression.getFreeReferences();
      for (let reference of references) {
        if (NamedArray.findByName(attributes, reference)) continue;
        attributes.push(AttributeInfo.fromJS({ name: reference, type: "STRING" }));
      }
    });

    measures.forEachMeasure(measure => {
      const references = Measure.getReferences(measure.expression);
      const countDistinctReferences = Measure.getCountDistinctReferences(measure.expression);
      for (let reference of references) {
        if (NamedArray.findByName(attributes, reference)) continue;
        if (countDistinctReferences.indexOf(reference) !== -1) {
          attributes.push(AttributeInfo.fromJS({ name: reference, type: "STRING", nativeType: "hyperUnique" }));
        } else {
          attributes.push(AttributeInfo.fromJS({ name: reference, type: "NUMBER" }));
        }
      }
    });

    if (attributeOverrides.length) {
      attributes = AttributeInfo.override(attributes, attributeOverrides);
    }

    return attributes;
  }

  public addAttributes(newAttributes: Attributes): DataCube {
    let { dimensions, measures, attributes } = this;
    const introspection = this.getIntrospection();
    if (introspection === "none") return this;

    const autofillDimensions = introspection === "autofill-dimensions-only" || introspection === "autofill-all";
    const autofillMeasures = introspection === "autofill-measures-only" || introspection === "autofill-all";

    const $main = $("main");

    for (let newAttribute of newAttributes) {
      const { name, type, nativeType } = newAttribute;

      // Already exists as a current attribute
      if (attributes && NamedArray.findByName(attributes, name)) continue;

      // Already exists as a current dimension or a measure
      const urlSafeName = makeUrlSafeName(name);
      if (this.getDimension(urlSafeName) || this.getMeasure(urlSafeName)) continue;

      let expression: Expression;
      switch (type) {
        case "TIME":
          if (!autofillDimensions) continue;
          expression = $(name);
          if (this.getDimensionByExpression(expression)) continue;
          // Add to the start
          dimensions = dimensions.prepend(new Dimension({
            name: urlSafeName,
            kind: "time",
            formula: expression.toString()
          }));
          break;

        case "STRING":
          if (nativeType === "hyperUnique" || nativeType === "thetaSketch") {
            if (!autofillMeasures) continue;

            const newMeasures = Measure.measuresFromAttributeInfo(newAttribute);
            newMeasures.forEach(newMeasure => {
              if (this.measures.getMeasureByExpression(newMeasure.expression)) return;
              measures = measures.append(newMeasure);
            });
          } else {
            if (!autofillDimensions) continue;
            expression = $(name);
            if (this.getDimensionByExpression(expression)) continue;
            dimensions = dimensions.append(new Dimension({
              name: urlSafeName,
              formula: expression.toString()
            }));
          }
          break;

        case "SET/STRING":
          if (!autofillDimensions) continue;
          expression = $(name);
          if (this.getDimensionByExpression(expression)) continue;
          dimensions = dimensions.append(new Dimension({
            name: urlSafeName,
            formula: expression.toString()
          }));
          break;

        case "BOOLEAN":
          if (!autofillDimensions) continue;
          expression = $(name);
          if (this.getDimensionByExpression(expression)) continue;
          dimensions = dimensions.append(new Dimension({
            name: urlSafeName,
            kind: "boolean",
            formula: expression.toString()
          }));
          break;

        case "NUMBER":
          if (!autofillMeasures) continue;

          const newMeasures = Measure.measuresFromAttributeInfo(newAttribute);
          newMeasures.forEach(newMeasure => {
            if (this.measures.getMeasureByExpression(newMeasure.expression)) return;
            measures = (name === "count") ? measures.prepend(newMeasure) : measures.append(newMeasure);
          });
          break;

        // TODO: quick fix after upgrade of Plywood to 0.17.26
        case "NULL":
          if (nativeType === "hyperUnique" || nativeType === "thetaSketch" || nativeType === "approximateHistogram") {
            if (!autofillMeasures) continue;

            const newMeasures = Measure.measuresFromAttributeInfo(newAttribute);
            newMeasures.forEach(newMeasure => {
              if (this.measures.getMeasureByExpression(newMeasure.expression)) return;
              measures = measures.append(newMeasure);
            });
          } else {
            throw new Error(`unsupported type ${type} with nativeType ${nativeType}`);
          }
          break;
        default:
          throw new Error(`unsupported type ${type}`);
      }
    }

    if (!this.rolledUp() && !measures.containsMeasureWithName("count")) {
      measures = measures.prepend(new Measure({
        name: "count",
        formula: $main.count().toString()
      }));
    }

    let value = this.valueOf();
    value.attributes = attributes ? AttributeInfo.override(attributes, newAttributes) : newAttributes;
    value.dimensions = dimensions;
    value.measures = measures;

    if (!value.defaultSortMeasure) {
      value.defaultSortMeasure = measures.size() ? measures.first().name : null;
    }

    if (!value.timeAttribute && dimensions.size && dimensions.first().kind === "time") {
      value.timeAttribute = <RefExpression> dimensions.first().expression;
    }

    return new DataCube(value);
  }

  public getIntrospection(): Introspection {
    return this.introspection || DataCube.DEFAULT_INTROSPECTION;
  }

  public getDefaultTimezone(): Timezone {
    return this.defaultTimezone || DataCube.DEFAULT_DEFAULT_TIMEZONE;
  }

  public getDefaultFilter(): Filter {
    let filter = this.defaultFilter || DataCube.DEFAULT_DEFAULT_FILTER;
    if (this.timeAttribute) {
      filter = filter.setSelection(
        this.timeAttribute,
        $(FilterClause.MAX_TIME_REF_NAME).timeRange(this.getDefaultDuration(), -1)
      );
    }
    return filter;
  }

  public getDefaultSplits(): Splits {
    return this.defaultSplits || DataCube.DEFAULT_DEFAULT_SPLITS;
  }

  public getDefaultDuration(): Duration {
    return this.defaultDuration || DataCube.DEFAULT_DEFAULT_DURATION;
  }

  public getDefaultSortMeasure(): string {
    if (this.defaultSortMeasure) {
      return this.defaultSortMeasure;
    }

    if (this.measures.size() > 0) {
      return this.measures.first().name;
    }

    return null;
  }

  public getDefaultSelectedMeasures(): OrderedSet<string> {
    return this.defaultSelectedMeasures || this.measures.getFirstNMeasureNames(4);
  }

  public getDefaultPinnedDimensions(): OrderedSet<string> {
    return this.defaultPinnedDimensions || (OrderedSet([]) as any);
  }

  public change(propertyName: string, newValue: any): DataCube {
    let v = this.valueOf();

    if (!v.hasOwnProperty(propertyName)) {
      throw new Error(`Unknown property : ${propertyName}`);
    }

    (v as any)[propertyName] = newValue;
    return new DataCube(v);
  }

  public changeDefaultSortMeasure(defaultSortMeasure: string) {
    return this.change("defaultSortMeasure", defaultSortMeasure);
  }

  public changeTitle(title: string) {
    return this.change("title", title);
  }

  public changeDescription(description: string) {
    return this.change("description", description);
  }

  public changeMeasures(measures: List<Measure>) {
    return this.change("measures", measures);
  }

  public getDefaultSortExpression(): SortExpression {
    return new SortExpression({
      expression: $(this.defaultSortMeasure),
      direction: SortExpression.DESCENDING
    });
  }

  public sameGroup(otherDataCube: DataCube): boolean {
    return Boolean(this.group && this.group === otherDataCube.group);
  }
}

check = DataCube;
