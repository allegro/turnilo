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
import { List } from "immutable";
import {
  $,
  AttributeInfo,
  AttributeJSs,
  Attributes,
  CustomDruidAggregations,
  CustomDruidTransforms,
  Executor,
  Expression,
  ExpressionJS,
  External,
  RefExpression
} from "plywood";
import { Logger } from "../../logger/logger";
import { isTruthy, quoteNames, verifyUrlSafeName } from "../../utils/general/general";
import { Cluster } from "../cluster/cluster";
import { Dimension, DimensionKind, timeDimension as createTimeDimension } from "../dimension/dimension";
import {
  allDimensions,
  ClientDimensions,
  DimensionOrGroupJS,
  Dimensions,
  findDimensionByExpression,
  findDimensionByName,
  fromConfig as dimensionsFromConfig,
  prepend,
  serialize as serializeDimensions,
  SerializedDimensions
} from "../dimension/dimensions";
import { RelativeTimeFilterClause, TimeFilterPeriod } from "../filter-clause/filter-clause";
import { EMPTY_FILTER, Filter, FilterJS } from "../filter/filter";
import {
  allMeasures,
  findMeasureByName,
  fromConfig as measuresFromConfig,
  hasMeasureWithName,
  MeasureOrGroupJS,
  Measures,
  serialize as serializeMeasures,
  SerializedMeasures
} from "../measure/measures";
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
    const measureNames = Object.keys(measures.byName);

    const duplicateNames = List(measureNames)
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
  timeAttribute: RefExpression;
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
  defaultFilter?: FilterJS;
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
  measures: SerializedMeasures;
  timeAttribute: string;
  defaultTimezone: string;
  defaultFilter?: FilterJS;
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
  timeAttribute: string;
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

// TODO: this function should return Sum type DruidCluster<Druid> | NativeCluster<void> and we should use it in all DataCube types below
function verifyCluster(config: DataCubeJS, cluster?: Cluster) {
  if (config.clusterName === "native") return;
  if (cluster === undefined) {
    throw new Error(`Could not find non-native cluster with name "${config.clusterName}" for data cube "${config.name}"`);
  }
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

function readTimeAttribute(config: DataCubeJS, cluster: Cluster | undefined, dimensions: Dimensions, logger: Logger): { dimensions: Dimensions, timeAttribute: RefExpression } {
  const isFromDruidCluster = config.clusterName !== "native" && cluster.type === "druid";
  if (isFromDruidCluster) {
    if (!isTruthy(config.timeAttribute)) {
      logger.warn(`DataCube "${config.name}" should have property timeAttribute. Setting timeAttribute to default value "__time"`);
    }
    if (isTruthy(config.timeAttribute) && config.timeAttribute !== "__time") {
      logger.warn(`timeAttribute in DataCube "${config.name}" should have value "__time" because it is required by Druid. Overriding timeAttribute to "__time"`);
    }
    const timeAttribute = $("__time");
    if (!isTruthy(findDimensionByExpression(dimensions, timeAttribute))) {
      return {
        timeAttribute,
        dimensions: prepend(createTimeDimension(timeAttribute), dimensions)
      };
    } else {
      return { timeAttribute, dimensions };
    }
  } else {
    if (!isTruthy(config.timeAttribute)) {
      throw new Error(`DataCube "${config.name}" must have defined timeAttribute property`);
    }
    const timeAttribute = $(config.timeAttribute);
    return {
      timeAttribute,
      dimensions
    };
  }
}

function readDimensions(config: DataCubeJS): Dimensions {
  return dimensionsFromConfig(config.dimensions || []);
}

function readColumns(config: DataCubeJS): { dimensions: Dimensions, measures: Measures } {
  const name = config.name;
  try {
    const dimensions = readDimensions(config);
    const measures = measuresFromConfig(config.measures || []);

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
    if (!hasMeasureWithName(measures, config.defaultSortMeasure)) {
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

export function fromConfig(config: DataCubeJS & LegacyDataCubeJS, cluster: Cluster | undefined, logger: Logger): DataCube {
  const name = readName(config);
  const introspection = readIntrospection(config);
  verifyCluster(config, cluster);
  const { attributes, attributeOverrides, derivedAttributes } = readAttributes(config);

  const refreshRule = config.refreshRule ? RefreshRule.fromJS(config.refreshRule) : RefreshRule.query();
  const { dimensions: initialDimensions, measures } = readColumns(config);
  const { timeAttribute, dimensions } = readTimeAttribute(config, cluster, initialDimensions, logger);
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
    defaultFilter,
    defaultTimezone: config.defaultTimezone ? Timezone.fromJS(config.defaultTimezone) : DEFAULT_DEFAULT_TIMEZONE,
    defaultSplitDimensions: config.defaultSplitDimensions || [],
    defaultDuration: config.defaultDuration ? Duration.fromJS(config.defaultDuration) : DEFAULT_DEFAULT_DURATION,
    defaultSortMeasure: getDefaultSortMeasure(config, measures),
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
    dimensions: serializeDimensions(dimensions),
    extendedDescription,
    group,
    maxSplits,
    measures: serializeMeasures(measures),
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

export function fromClusterAndExternal(name: string, cluster: Cluster, external: External, logger: Logger): QueryableDataCube {
  const dataCube = fromConfig({
    name,
    clusterName: cluster.name,
    source: String(external.source),
    refreshRule: RefreshRule.query().toJS()
  }, cluster, logger);

  return attachExternalExecutor(dataCube, external);
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

export function getTimeDimension(dataCube: ClientDataCube): Dimension {
  const dimension =  findDimensionByExpression(dataCube.dimensions, $(dataCube.timeAttribute));
  if (dimension === null) {
    throw new Error(`Expected DataCube "${dataCube.name}" to have timeAttribute property defined with expression of existing dimension`);
  }
  return dimension;
}

export function getTimeDimensionReference(dataCube: ClientDataCube): string {
  return getTimeDimension(dataCube).name;
}

export function getDefaultFilter(dataCube: ClientDataCube): Filter {
  const filter = dataCube.defaultFilter || DEFAULT_DEFAULT_FILTER;
  if (!dataCube.timeAttribute) return filter;
  const timeDimensionReference = getTimeDimensionReference(dataCube);
  return filter.insertByIndex(0, new RelativeTimeFilterClause({
    period: TimeFilterPeriod.LATEST,
    duration: dataCube.defaultDuration,
    reference: timeDimensionReference
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
  if (dataCube.defaultSelectedMeasures.length > 0) {
    return SeriesList.fromMeasures(dataCube.defaultSelectedMeasures.map(name => findMeasureByName(dataCube.measures, name)));
  }
  const first4Measures = allMeasures(dataCube.measures).slice(0, 4);
  return SeriesList.fromMeasures(first4Measures);
}

export function getDefaultSortMeasure(dataCube: { defaultSortMeasure?: string }, measures: Measures): string | undefined {
  if (dataCube.defaultSortMeasure) return dataCube.defaultSortMeasure;
  const firstMeasure = allMeasures(measures)[0];
  if (firstMeasure) return firstMeasure.name;
  return undefined;
}
