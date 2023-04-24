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

import { BaseImmutable } from "immutable-class";
import { External } from "plywood";
import { URL } from "url";
import { RequestDecorator, RequestDecoratorJS } from "../../../server/utils/request-decorator/request-decorator";
import { RetryOptions, RetryOptionsJS } from "../../../server/utils/retry-options/retry-options";
import { Logger } from "../../logger/logger";
import { isNil, isTruthy, optionalEnsureOneOf, verifyUrlSafeName } from "../../utils/general/general";
import { ClusterAuth, ClusterAuthJS, readClusterAuth } from "../cluster-auth/cluster-auth";

export type SourceListScan = "disable" | "auto";

export type ClusterType = "druid";

export interface Cluster {
  type: ClusterType;
  name: string;
  url: string;
  title?: string;
  version?: string;
  timeout?: number;
  healthCheckTimeout: number;
  sourceListScan: SourceListScan;
  sourceListRefreshOnLoad: boolean;
  sourceListRefreshInterval: number;
  sourceReintrospectOnLoad: boolean;
  sourceReintrospectInterval: number;
  sourceTimeBoundaryRefreshInterval: number;
  guardDataCubes?: boolean;
  introspectionStrategy?: string;
  requestDecorator?: RequestDecorator;
  retry?: RetryOptions;
  auth?: ClusterAuth;
}

export interface ClusterJS {
  name: string;
  title?: string;
  url: string;
  version?: string;
  timeout?: number;
  healthCheckTimeout?: number;
  sourceListScan?: SourceListScan;
  sourceListRefreshOnLoad?: boolean;
  sourceListRefreshInterval?: number;
  sourceReintrospectOnLoad?: boolean;
  sourceReintrospectInterval?: number;
  sourceTimeBoundaryRefreshInterval?: number;
  guardDataCubes?: boolean;
  introspectionStrategy?: string;
  requestDecorator?: RequestDecoratorJS;
  retry?: RetryOptionsJS;
  auth?: ClusterAuthJS;
}

export interface SerializedCluster {
  type: ClusterType;
  name: string;
  timeout: number;
}

export interface ClientCluster {
  type: ClusterType;
  name: string;
  timeout: number;
}

function ensureNotNative(name: string): void {
  if (name === "native") {
    throw new Error("Cluster name can not be 'native'");
  }
}

function ensureNotTiny(v: number): void {
  if (v === 0) return;
  if (v < 1000) {
    throw new Error(`Interval can not be < 1000 (is ${v})`);
  }
}

function validateUrl(url: string): void {
  try {
    new URL(url);
  } catch (e) {
    throw new Error(`Cluster url: ${url} has invalid format. It should be http[s]://hostname[:port]`);
  }
}

const HTTP_PROTOCOL_TEST = /^http(s?):/;

function readUrl(cluster: any): string {
  if (isTruthy(cluster.url)) {
    validateUrl(cluster.url);
    return cluster.url;
  }
  const oldHost = cluster.host || cluster.druidHost || cluster.brokerHost;
  if (isTruthy(oldHost)) {
    const url = HTTP_PROTOCOL_TEST.test(oldHost) ? oldHost : `http://${oldHost}`;
    validateUrl(url);
    return url;
  }
  throw new Error("Cluster: missing url field");
}

function readRequestDecorator(cluster: any, logger: Logger): RequestDecorator | null {
  if (typeof cluster.requestDecorator === "string" || !isNil(cluster.decoratorOptions)) {
    logger.warn(`Cluster ${cluster.name} : requestDecorator as string and decoratorOptions fields are deprecated. Use object with path and options fields`);
    return RequestDecorator.fromJS({ path: cluster.requestDecorator, options: cluster.decoratorOptions });
  }
  if (isTruthy(cluster.requestDecorator)) return RequestDecorator.fromJS(cluster.requestDecorator);
  return null;
}

function readRetryOptions(options: RetryOptionsJS | undefined): RetryOptions | undefined {
  if (isNil(options)) return undefined;
  return new RetryOptions(options);
}

const DEFAULT_HEALTH_CHECK_TIMEOUT = 1000;
export const DEFAULT_SOURCE_LIST_SCAN: SourceListScan = "auto";
const SOURCE_LIST_SCAN_VALUES: SourceListScan[] = ["disable", "auto"];
export const DEFAULT_SOURCE_LIST_REFRESH_INTERVAL = 0;
export const DEFAULT_SOURCE_LIST_REFRESH_ON_LOAD = false;
export const DEFAULT_SOURCE_REINTROSPECT_INTERVAL = 0;
export const DEFAULT_SOURCE_REINTROSPECT_ON_LOAD = false;
export const DEFAULT_SOURCE_TIME_BOUNDARY_REFRESH_INTERVAL = 60000;
export const DEFAULT_INTROSPECTION_STRATEGY = "segment-metadata-fallback";
const DEFAULT_GUARD_DATA_CUBES = false;

function readInterval(value: number | string, defaultValue: number): number {
  if (!isTruthy(value)) return defaultValue;
  const numberValue = typeof value === "string" ? parseInt(value, 10) : value;
  BaseImmutable.ensure.number(numberValue);
  ensureNotTiny(numberValue);
  return numberValue;
}

export function fromConfig(params: ClusterJS, logger: Logger): Cluster {
  const {
    name,
    sourceListScan = DEFAULT_SOURCE_LIST_SCAN,
    sourceListRefreshOnLoad = DEFAULT_SOURCE_LIST_REFRESH_ON_LOAD,
    sourceReintrospectOnLoad = DEFAULT_SOURCE_REINTROSPECT_ON_LOAD,
    version = null,
    title = "",
    guardDataCubes = DEFAULT_GUARD_DATA_CUBES,
    introspectionStrategy = DEFAULT_INTROSPECTION_STRATEGY,
    healthCheckTimeout = DEFAULT_HEALTH_CHECK_TIMEOUT
  } = params;

  verifyUrlSafeName(name);
  ensureNotNative(name);

  optionalEnsureOneOf(sourceListScan, SOURCE_LIST_SCAN_VALUES, "Cluster: sourceListScan");

  const sourceReintrospectInterval = readInterval(params.sourceReintrospectInterval, DEFAULT_SOURCE_REINTROSPECT_INTERVAL);
  const sourceListRefreshInterval = readInterval(params.sourceListRefreshInterval, DEFAULT_SOURCE_LIST_REFRESH_INTERVAL);
  const sourceTimeBoundaryRefreshInterval = readInterval(params.sourceTimeBoundaryRefreshInterval, DEFAULT_SOURCE_TIME_BOUNDARY_REFRESH_INTERVAL);
  const retry = readRetryOptions(params.retry);
  const requestDecorator = readRequestDecorator(params, logger);
  const auth = readClusterAuth(params.auth);

  const url = readUrl(params);

  return {
    type: "druid",
    timeout: typeof params.timeout === "string" ? parseInt(params.timeout, 10) : params.timeout,
    name,
    url,
    retry,
    requestDecorator,
    sourceListScan,
    sourceListRefreshInterval,
    sourceListRefreshOnLoad,
    sourceReintrospectInterval,
    sourceReintrospectOnLoad,
    sourceTimeBoundaryRefreshInterval,
    version,
    title,
    guardDataCubes,
    introspectionStrategy,
    healthCheckTimeout,
    auth
  };
}

export function serialize(cluster: Cluster): SerializedCluster {
  return {
    type: "druid",
    name: cluster.name,
    timeout: cluster.timeout
  };
}

export function makeExternalFromSourceName(source: string, version?: string): External {
  return External.fromValue({
    engine: "druid",
    source,
    version,
    suppress: true,

    allowSelectQueries: true,
    allowEternity: false
  });
}

export function shouldScanSources(cluster: Cluster): boolean {
  return cluster.sourceListScan === "auto";
}
