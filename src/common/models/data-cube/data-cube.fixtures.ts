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
import { $, AttributeInfo, basicExecutorFactory, Dataset, Expression } from "plywood";
import { Omit } from "../../utils/functional/functional";
import { ClusterFixtures } from "../cluster/cluster.fixtures";
import { fromConfig } from "../dimension/dimensions";
import { DimensionsFixtures } from "../dimension/dimensions.fixtures";
import { Measures } from "../measure/measures";
import { MeasuresFixtures } from "../measure/measures.fixtures";
import { RefreshRule } from "../refresh-rule/refresh-rule";
import { ClientDataCube, DataCube, DEFAULT_MAX_QUERIES, DEFAULT_MAX_SPLITS } from "./data-cube";

const executor = basicExecutorFactory({
  datasets: {
    wiki: Dataset.fromJS([]),
    twitter: Dataset.fromJS([])
  }
});

export const wikiDataCube: DataCube = {
  derivedAttributes: {},
  options: {},
  subsetExpression: Expression.TRUE,
  dimensions: DimensionsFixtures.wiki(),
  measures: Measures.fromJS(MeasuresFixtures.wikiJS()),
  attributeOverrides: [],
  attributes: AttributeInfo.fromJSs([
    { name: "time", type: "TIME" },
    { name: "articleName", type: "STRING" },
    { name: "page", type: "STRING" },
    { name: "userChars", type: "SET/STRING" },
    { name: "count", type: "NUMBER", unsplitable: true, maker: { op: "count" } }
  ]),
  cluster: ClusterFixtures.druidWikiCluster(),
  defaultDuration: Duration.fromJS("P3D"),
  defaultSplitDimensions: [],
  maxQueries: DEFAULT_MAX_QUERIES,
  defaultPinnedDimensions: ["articleName"],
  defaultSelectedMeasures: ["count"],
  defaultSortMeasure: "count",
  defaultTimezone: Timezone.fromJS("Etc/UTC"),
  extendedDescription: "",
  group: "",
  maxSplits: 4,
  name: "wiki",
  refreshRule: RefreshRule.fromJS({
    time: new Date("2016-04-30T12:39:51.350Z"),
    rule: "fixed"
  }),
  rollup: false,
  timeAttribute: $("time"),
  title: "Wiki",
  description: "Wiki full description something about articles and editors",
  clusterName: "druid-wiki",
  source: "wiki",
  introspection: "none"
};

function pickClientProperties(dc: DataCube): Omit<ClientDataCube, "executor"> {
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
  } = dc;
  return {
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
    timeAttribute: timeAttribute && timeAttribute.name,
    title
  };
}

export const wikiClientDataCube: ClientDataCube = {
  ...pickClientProperties(wikiDataCube),
  executor
};

export const twitterDataCube: DataCube = {
  defaultSplitDimensions: [],
  maxQueries: DEFAULT_MAX_QUERIES,
  cluster: ClusterFixtures.druidTwitterCluster(),
  defaultSelectedMeasures: [],
  attributeOverrides: [],
  attributes: [],
  derivedAttributes: {},
  maxSplits: DEFAULT_MAX_SPLITS,
  options: {},
  rollup: false,
  subsetExpression: Expression.TRUE,
  name: "twitter",
  title: "Twitter",
  description: "Twitter full description should go here - tweets and followers",
  clusterName: "druid-twitter",
  source: "twitter",
  introspection: "none",
  dimensions: DimensionsFixtures.twitter(),
  measures: Measures.fromJS(MeasuresFixtures.twitterJS()),
  timeAttribute: $("time"),
  defaultTimezone: Timezone.fromJS("Etc/UTC"),
  defaultDuration: Duration.fromJS("P3D"),
  defaultSortMeasure: "count",
  defaultPinnedDimensions: ["tweet"],
  refreshRule: RefreshRule.fromJS({
    rule: "realtime"
  })
};

export const twitterClientDataCube: ClientDataCube = {
  ...pickClientProperties(twitterDataCube),
  executor
};

export function customCube(title: string, description: string, extendedDescription = ""): DataCube {
  return {
    clusterName: "druid-custom",
    source: "custom",
    introspection: "none",
    defaultSplitDimensions: [],
    maxQueries: DEFAULT_MAX_QUERIES,
    dimensions: fromConfig([]),
    measures: Measures.fromMeasures([]),
    timeAttribute: $("time"),
    defaultTimezone: Timezone.fromJS("Etc/UTC"),
    defaultDuration: Duration.fromJS("P3D"),
    maxSplits: 4,
    refreshRule: RefreshRule.fromJS({
      rule: "realtime"
    }),
    name: "custom",
    attributeOverrides: [],
    attributes: [],
    defaultPinnedDimensions: [],
    defaultSelectedMeasures: [],
    derivedAttributes: {},
    description,
    extendedDescription,
    options: {},
    rollup: false,
    subsetExpression: Expression.TRUE,
    title
  };
}

export function customClientCube(title: string, description: string, extendedDescription = ""): ClientDataCube {
  return {
    ...pickClientProperties(customCube(title, description, extendedDescription)),
    executor
  };
}

export function customCubeWithGuard(): DataCube {
  return {
    clusterName: "druid-custom",
    cluster: ClusterFixtures.druidTwitterClusterJSWithGuard(),
    source: "custom",
    introspection: "none",
    defaultSplitDimensions: [],
    maxQueries: DEFAULT_MAX_QUERIES,
    dimensions: fromConfig([]),
    measures: Measures.fromMeasures([]),
    timeAttribute: $("time"),
    defaultTimezone: Timezone.fromJS("Etc/UTC"),
    defaultDuration: Duration.fromJS("P3D"),
    maxSplits: 4,
    refreshRule: RefreshRule.fromJS({
      rule: "realtime"
    }),
    name: "some-name",
    attributeOverrides: [],
    attributes: [],
    defaultPinnedDimensions: [],
    defaultSelectedMeasures: [],
    derivedAttributes: {},
    description: "",
    extendedDescription: "",
    options: {},
    rollup: false,
    subsetExpression: Expression.TRUE,
    title: "customDataCubeWithGuard"
  };
}
