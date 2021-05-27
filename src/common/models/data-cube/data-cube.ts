/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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
import {
  $,
  AttributeInfo,
  AttributeJSs,
  Attributes,
  CustomDruidAggregations,
  CustomDruidTransforms,
  Dataset,
  Executor,
  Expression,
  ExpressionJS,
  External,
  ply,
  RefExpression
} from "plywood";
import { quoteNames, verifyUrlSafeName } from "../../utils/general/general";
import { Cluster } from "../cluster/cluster";
import { Dimension, DimensionKind, timeDimension } from "../dimension/dimension";
import {
  allDimensions,
  ClientDimensions,
  DimensionOrGroupJS,
  Dimensions,
  findDimensionByExpression,
  findDimensionByName,
  fromConfig as dimensionsFromConfig,
  prepend,
  serialize as dimensionsSerialize,
  SerializedDimensions
} from "../dimension/dimensions";
import { RelativeTimeFilterClause, TimeFilterPeriod } from "../filter-clause/filter-clause";
import { EMPTY_FILTER, Filter } from "../filter/filter";
import { MeasureOrGroupJS } from "../measure/measure-group";
import { Measures } from "../measure/measures";
import { QueryDecoratorDefinition, QueryDecoratorDefinitionJS } from "../query-decorator/query-decorator";
import { RefreshRule, RefreshRuleJS } from "../refresh-rule/refresh-rule";
import { SeriesList } from "../series-list/series-list";
import { EMPTY_SPLITS, Splits } from "../splits/splits";
import { Timekeeper } from "../timekeeper/timekeeper";
import { attachExternalExecutor, QueryableDataCube } from "./queryable-data-cube";

export const DEFAULT_INTROSPECTION: Introspection = "autofill-all";
const INTROSPECTION_VALUES = new Set(["none", "no-autofill", "autofill-dimensions-only", "autofill-measures-only", "autofill-all"]);
export const DEFAULT_DEFAULT_TIMEZONE = Timezone.UTC;
const DEFAULT_DEFAULT_FILTER = EMPTY_FILTER;
const DEFAULT_DEFAULT_SPLITS = EMPTY_SPLITS;
export const DEFAULT_DEFAULT_DURATION = Duration.fromJS("P1D");
export const DEFAULT_MAX_SPLITS = 3;
export const DEFAULT_MAX_QUERIES = 500;

function checkDimensionsAndMeasuresNamesUniqueness(dimensions: Dimensions, measures: Measures, dataCubeName: string) {
  if (dimensions != null && measures != null) {
    const dimensionNames = Object.keys(dimensions.byName);
    const measureNames = measures.getMeasureNames();

    const duplicateNames = measureNames
      .concat(dimensionNames)
      .groupBy(name => name)
      .filter(names => names.count() > 1)
      .map((names, name) => name)
      .toList();

    if (duplicateNames.size > 0) {
      throw new Error(`data cube: '${dataCubeName}', names: ${quoteNames(duplicateNames)} found in both dimensions and measures'`);
    }
  }
}

export type Introspection =
  "none"
  | "no-autofill"
  | "autofill-dimensions-only"
  | "autofill-measures-only"
  | "autofill-all";

export type Source = string | string[];

export interface DataCube {
  name: string;
  title: string;
  description: string;
  extendedDescription?: string;
  clusterName: string;
  source: Source;
  group?: string;
  subsetExpression: Expression;
  rollup: boolean;
  options: DataCubeOptions;
  introspection?: Introspection;
  attributeOverrides: Attributes;
  attributes: Attributes;
  derivedAttributes: Record<string, Expression>;

  dimensions: Dimensions;
  measures: Measures;
  timeAttribute?: RefExpression;
  defaultTimezone: Timezone;
  defaultFilter?: Filter;
  defaultSplitDimensions: string[];
  defaultDuration: Duration;
  defaultSortMeasure?: string;
  defaultSelectedMeasures: string[];
  defaultPinnedDimensions: string[];
  refreshRule: RefreshRule;
  maxSplits: number;
  maxQueries: number;
  queryDecorator?: QueryDecoratorDefinition;
  cluster?: Cluster;
}

export interface DataCubeJS {
  name: string;
  title?: string;
  description?: string;
  extendedDescription?: string;
  clusterName: string;
  source: Source;
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
  defaultFilter?: any;
  defaultSplitDimensions?: string[];
  defaultDuration?: string;
  defaultSortMeasure?: string;
  defaultSelectedMeasures?: string[];
  defaultPinnedDimensions?: string[];
  refreshRule?: RefreshRuleJS;
  maxSplits?: number;
  maxQueries?: number;
  queryDecorator?: QueryDecoratorDefinitionJS;
}

export interface SerializedDataCube {
  name: string;
  title: string;
  description: string;
  extendedDescription?: string;
  clusterName: string;
  source: Source;
  group: string;
  rollup: boolean;
  options: DataCubeOptions;
  attributes: AttributeJSs;

  dimensions: SerializedDimensions;
  measures: MeasureOrGroupJS[];
  timeAttribute?: string;
  defaultTimezone: string;
  defaultFilter?: any; // TODO why?
  defaultSplitDimensions?: string[];
  defaultDuration: string;
  defaultSortMeasure?: string;
  defaultSelectedMeasures: string[];
  defaultPinnedDimensions: string[];
  refreshRule: RefreshRuleJS;
  maxSplits: number;
}

export interface ClientDataCube {
  name: string;
  title: string;
  description: string;
  extendedDescription?: string;
  clusterName: string;
  source: Source;
  group?: string;
  rollup: boolean;
  options: DataCubeOptions;
  attributes: Attributes;

  dimensions: ClientDimensions;
  measures: Measures;
  timeAttribute?: string;
  defaultTimezone: Timezone;
  defaultFilter?: Filter;
  defaultSplitDimensions?: string[];
  defaultDuration: Duration;
  defaultSortMeasure?: string;
  defaultSelectedMeasures: string[];
  defaultPinnedDimensions: string[];
  refreshRule: RefreshRule;
  maxSplits: number;
  executor: Executor;
}

function readDescription({
                           description,
                           extendedDescription
                         }: DataCubeJS): { description: string, extendedDescription?: string } {
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

interface LegacyDataCubeJS {
  subsetFilter?: string;
}

function readIntrospection(config: DataCubeJS): Introspection {
  const introspection = config.introspection || DEFAULT_INTROSPECTION;
  if (!INTROSPECTION_VALUES.has(introspection)) {
    throw new Error(`invalid introspection value ${introspection}, must be one of ${[...INTROSPECTION_VALUES].join(", ")}`);
  }
  return introspection;
}

function readName(config: DataCubeJS): string {
  const name = config.name;
  if (!name) throw new Error("DataCube must have a name");
  verifyUrlSafeName(name);
  return name;
}

function verifyCluster(config: DataCubeJS, cluster?: Cluster) {
  if (cluster === undefined) return;
  if (config.clusterName !== cluster.name) {
    throw new Error(`Cluster name '${config.clusterName}' was given but '${cluster.name}' cluster was supplied (must match)`);
  }
}

function readAttributes(config: DataCubeJS): Pick<DataCube, "attributes" | "attributeOverrides" | "derivedAttributes"> {
  const attributeOverrides = AttributeInfo.fromJSs(config.attributeOverrides || []);
  const attributes = AttributeInfo.fromJSs(config.attributes || []);
  const derivedAttributes = config.derivedAttributes ? Expression.expressionLookupFromJS(config.derivedAttributes) : {};
  return {
    attributes,
    attributeOverrides,
    derivedAttributes
  };
}

function readTimeAttribute(config: DataCubeJS, cluster?: Cluster): RefExpression | undefined {
  const timeAttributeName = config.timeAttribute;
  if (timeAttributeName) return $(timeAttributeName);
  if (cluster && cluster.type === "druid" && !timeAttributeName) {
    return $("__time");
  }
  return undefined;
}

function readDimensions(config: DataCubeJS, timeAttribute?: RefExpression): Dimensions {
  const dimensions = dimensionsFromConfig(config.dimensions || []);
  if (timeAttribute && findDimensionByExpression(dimensions, timeAttribute) === null) {
    return prepend(timeDimension(timeAttribute), dimensions);
  }
  return dimensions;
}

function readColumns(config: DataCubeJS, timeAttribute: RefExpression): { dimensions: Dimensions, measures: Measures } {
  const name = config.name;
  try {
    const dimensions = readDimensions(config, timeAttribute);
    const measures = Measures.fromJS(config.measures || []);

    checkDimensionsAndMeasuresNamesUniqueness(dimensions, measures, name);
    return {
      dimensions,
      measures
    };
  } catch (e) {
    throw new Error(`data cube: '${name}', ${e.message}`);
  }
}

function verifyDefaultSortMeasure(config: DataCubeJS, measures: Measures) {
  if (config.defaultSortMeasure) {
    if (!measures.containsMeasureWithName(config.defaultSortMeasure)) {
      throw new Error(`Can not find defaultSortMeasure '${config.defaultSortMeasure}' in data cube '${config.name}'`);
    }
  }
}

function readDefaultFilter(config: DataCubeJS): Filter | undefined {
  if (!config.defaultFilter) return undefined;
  try {
    return Filter.fromJS(config.defaultFilter);
  } catch {
    throw new Error(`Incorrect format of default filter for ${config.name}. Ignoring field`);
  }
}

export function fromConfig(config: DataCubeJS & LegacyDataCubeJS, cluster?: Cluster): DataCube {
  const name = readName(config);
  const introspection = readIntrospection(config);
  verifyCluster(config, cluster);
  const { attributes, attributeOverrides, derivedAttributes } = readAttributes(config);

  const refreshRule = config.refreshRule ? RefreshRule.fromJS(config.refreshRule) : RefreshRule.query();
  const timeAttribute = readTimeAttribute(config, cluster);
  const { dimensions, measures } = readColumns(config, timeAttribute);
  verifyDefaultSortMeasure(config, measures);
  const subsetFormula = config.subsetFormula || config.subsetFilter;
  const defaultFilter = readDefaultFilter(config);

  const { description, extendedDescription } = readDescription(config);

  return {
    name,
    title: config.title || config.name,
    description,
    extendedDescription,
    clusterName: config.clusterName || "druid",
    source: config.source || config.name,
    group: config.group || null,
    subsetExpression: subsetFormula ? Expression.fromJSLoose(subsetFormula) : Expression.TRUE,
    rollup: Boolean(config.rollup),
    options: config.options || {},
    introspection,
    attributeOverrides,
    attributes,
    derivedAttributes,
    dimensions,
    measures,
    timeAttribute,
    // TODO: provide some better defaults, instead of nulls?
    defaultFilter,
    defaultTimezone: config.defaultTimezone ? Timezone.fromJS(config.defaultTimezone) : DEFAULT_DEFAULT_TIMEZONE,
    defaultSplitDimensions: config.defaultSplitDimensions || [],
    defaultDuration: config.defaultDuration ? Duration.fromJS(config.defaultDuration) : DEFAULT_DEFAULT_DURATION,
    defaultSortMeasure: config.defaultSortMeasure || (measures.size() ? measures.first().name : null),
    defaultSelectedMeasures: config.defaultSelectedMeasures || [],
    defaultPinnedDimensions: config.defaultPinnedDimensions || [],
    maxSplits: config.maxSplits || DEFAULT_MAX_SPLITS,
    maxQueries: config.maxQueries || DEFAULT_MAX_QUERIES,
    queryDecorator: config.queryDecorator ? QueryDecoratorDefinition.fromJS(config.queryDecorator) : null,
    refreshRule,
    cluster
  };
}

export function serialize(dataCube: DataCube): SerializedDataCube {
  const {
    attributes,
    clusterName,
    defaultDuration,
    defaultFilter,
    defaultPinnedDimensions,
    defaultSelectedMeasures,
    defaultSortMeasure,
    defaultSplitDimensions,
    defaultTimezone,
    description,
    dimensions,
    extendedDescription,
    group,
    maxSplits,
    measures,
    name,
    options,
    refreshRule,
    rollup,
    source,
    timeAttribute,
    title
  } = dataCube;
  return {
    attributes: attributes.map(a => a.toJS()),
    clusterName,
    defaultDuration: defaultDuration && defaultDuration.toJS(),
    defaultFilter: defaultFilter && defaultFilter.toJS(),
    defaultPinnedDimensions,
    defaultSelectedMeasures,
    defaultSortMeasure,
    defaultSplitDimensions,
    defaultTimezone: defaultTimezone.toJS(),
    description,
    dimensions: dimensionsSerialize(dimensions),
    extendedDescription,
    group,
    maxSplits,
    measures: measures.toJS(),
    name,
    options,
    refreshRule: refreshRule.toJS(),
    rollup,
    source,
    timeAttribute: timeAttribute.name,
    title
  };
}

export interface DataCubeOptions {
  customAggregations?: CustomDruidAggregations;
  customTransforms?: CustomDruidTransforms;
  druidContext?: Record<string, unknown>;
}

export function fromClusterAndExternal(name: string, cluster: Cluster, external: External): QueryableDataCube {
  const dataCube = fromConfig({
    name,
    clusterName: cluster.name,
    source: String(external.source),
    refreshRule: RefreshRule.query().toJS()
  }, cluster);

  return attachExternalExecutor(dataCube, external);
}

// TODO: move out?
export function queryMaxTime(timeAttribute?: RefExpression, executor?: Executor): Promise<Date> {
  if (!executor) {
    return Promise.reject(new Error("dataCube not ready"));
  }

  const ex = ply().apply("maxTime", $("main").max(timeAttribute));

  return executor(ex).then((dataset: Dataset) => {
    const maxTimeDate = dataset.data[0]["maxTime"] as Date;
    if (isNaN(maxTimeDate as any)) return null;
    return maxTimeDate;
  });
}

export function getMaxTime({ name, refreshRule }: ClientDataCube, timekeeper: Timekeeper): Date {
  if (refreshRule.isRealtime()) {
    return timekeeper.now();
  } else if (refreshRule.isFixed()) {
    return refreshRule.time;
  } else { // refreshRule is query
    return timekeeper.getTime(name);
  }
}

export function getDimensionsByKind(dataCube: { dimensions: Dimensions }, kind: DimensionKind): Dimension[] {
  return allDimensions(dataCube.dimensions).filter(d => d.kind === kind);
}

export function isTimeAttribute(dataCube: ClientDataCube, ex: Expression) {
  return ex instanceof RefExpression && ex.name === dataCube.timeAttribute;
}

export function getDefaultFilter(dataCube: ClientDataCube): Filter {
  const filter = dataCube.defaultFilter || DEFAULT_DEFAULT_FILTER;
  if (!dataCube.timeAttribute) return filter;
  return filter.insertByIndex(0, new RelativeTimeFilterClause({
    period: TimeFilterPeriod.LATEST,
    duration: dataCube.defaultDuration,
    reference: dataCube.timeAttribute
  }));
}

export function getDefaultSplits(dataCube: ClientDataCube): Splits {
  if (dataCube.defaultSplitDimensions) {
    const dimensions = dataCube.defaultSplitDimensions.map(name => findDimensionByName(dataCube.dimensions, name));
    return Splits.fromDimensions(dimensions);
  }
  return DEFAULT_DEFAULT_SPLITS;
}

export function getDefaultSeries(dataCube: ClientDataCube): SeriesList {
  const measureNames = dataCube.defaultSelectedMeasures || dataCube.measures.getFirstNMeasureNames(4).toArray();
  const measures = measureNames.map(name => dataCube.measures.getMeasureByName(name));
  return SeriesList.fromMeasures(measures);
}
