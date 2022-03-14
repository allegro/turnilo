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

import { Record } from "immutable";
import { BaseImmutable } from "immutable-class";
import { External } from "plywood";
import { URL } from "url";
import { RequestDecorator, RequestDecoratorJS } from "../../../server/utils/request-decorator/request-decorator";
import { RetryOptions, RetryOptionsJS } from "../../../server/utils/retry-options/retry-options";
import { isNil, isTruthy, verifyUrlSafeName } from "../../utils/general/general";

export type SourceListScan = "disable" | "auto";

export interface ClusterValue {
  name: string;
  url?: string;
  title?: string;
  version?: string;
  timeout?: number;
  healthCheckTimeout?: number;
  sourceListScan?: SourceListScan;
  sourceListRefreshOnLoad?: boolean;
  sourceListRefreshInterval?: number;
  sourceReintrospectOnLoad?: boolean;
  sourceReintrospectInterval?: number;
  guardDataCubes?: boolean;
  introspectionStrategy?: string;
  requestDecorator?: RequestDecorator;
  retry?: RetryOptions;
}

export interface ClusterJS {
  name: string;
  title?: string;
  url?: string;
  version?: string;
  timeout?: number;
  healthCheckTimeout?: number;
  sourceListScan?: SourceListScan;
  sourceListRefreshOnLoad?: boolean;
  sourceListRefreshInterval?: number;
  sourceReintrospectOnLoad?: boolean;
  sourceReintrospectInterval?: number;
  guardDataCubes?: boolean;
  introspectionStrategy?: string;
  requestDecorator?: RequestDecoratorJS;
  retry?: RetryOptionsJS;
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
  if (isTruthy(cluster.url)) return cluster.url;
  const oldHost = cluster.host || cluster.druidHost || cluster.brokerHost;
  return HTTP_PROTOCOL_TEST.test(oldHost) ? oldHost : `http://${oldHost}`;
}

function readRequestDecorator(cluster: any): RequestDecorator {
  if (typeof cluster.requestDecorator === "string" || !isNil(cluster.decoratorOptions)) {
    console.warn(`Cluster ${cluster.name} : requestDecorator as string and decoratorOptions fields are deprecated. Use object with path and options fields`);
    return RequestDecorator.fromJS({ path: cluster.requestDecorator, options: cluster.decoratorOptions });
  }
  return RequestDecorator.fromJS(cluster.requestDecorator);
}

const DEFAULT_HEALTH_CHECK_TIMEOUT = 1000;
export const DEFAULT_SOURCE_LIST_SCAN: SourceListScan = "auto";
const SOURCE_LIST_SCAN_VALUES: SourceListScan[] = ["disable", "auto"];
export const DEFAULT_SOURCE_LIST_REFRESH_INTERVAL = 0;
export const DEFAULT_SOURCE_LIST_REFRESH_ON_LOAD = false;
export const DEFAULT_SOURCE_REINTROSPECT_INTERVAL = 0;
export const DEFAULT_SOURCE_REINTROSPECT_ON_LOAD = false;
export const DEFAULT_INTROSPECTION_STRATEGY = "segment-metadata-fallback";
const DEFAULT_GUARD_DATA_CUBES = false;

const defaultCluster: ClusterValue = {
  guardDataCubes: DEFAULT_GUARD_DATA_CUBES,
  healthCheckTimeout: DEFAULT_HEALTH_CHECK_TIMEOUT,
  introspectionStrategy: DEFAULT_INTROSPECTION_STRATEGY,
  name: "",
  requestDecorator: undefined,
  sourceListRefreshInterval: DEFAULT_SOURCE_LIST_REFRESH_INTERVAL,
  sourceListRefreshOnLoad: DEFAULT_SOURCE_LIST_REFRESH_ON_LOAD,
  sourceListScan: DEFAULT_SOURCE_LIST_SCAN,
  sourceReintrospectInterval: DEFAULT_SOURCE_REINTROSPECT_INTERVAL,
  sourceReintrospectOnLoad: DEFAULT_SOURCE_REINTROSPECT_ON_LOAD,
  timeout: undefined,
  title: "",
  url: "",
  version: null
};

export class Cluster extends Record<ClusterValue>(defaultCluster) {

  static fromJS(params: ClusterJS): Cluster {
    const {
      name,
      sourceListScan,
      sourceListRefreshOnLoad,
      sourceReintrospectOnLoad,
      version,
      title,
      guardDataCubes,
      introspectionStrategy,
      healthCheckTimeout
    } = params;

    verifyUrlSafeName(name);
    ensureNotNative(name);

    if (!SOURCE_LIST_SCAN_VALUES.includes(sourceListScan)) {
      throw new Error(`Cluster: Incorrect sourceListScane value : ${sourceListScan}. Possible values: ${SOURCE_LIST_SCAN_VALUES.join(", ")}`);
    }

    const sourceReintrospectInterval = typeof params.sourceReintrospectInterval === "string" ? parseInt(params.sourceReintrospectInterval, 10) : params.sourceListRefreshInterval;
    BaseImmutable.ensure.number(sourceReintrospectInterval);
    ensureNotTiny(sourceReintrospectInterval);

    const sourceListRefreshInterval = typeof params.sourceListRefreshInterval === "string" ? parseInt(params.sourceListRefreshInterval, 10) : params.sourceListRefreshInterval;
    BaseImmutable.ensure.number(sourceListRefreshInterval);
    ensureNotTiny(sourceListRefreshInterval);

    const retry = RetryOptions.fromJS(params.retry);
    const requestDecorator = readRequestDecorator(params);

    const url = readUrl(params);
    validateUrl(url);

    return new Cluster({
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
      version,
      title,
      guardDataCubes,
      introspectionStrategy,
      healthCheckTimeout
    });
  }

  public type = "druid";

  public toClientCluster(): Cluster {
    return new Cluster({
      name: this.name,
      timeout: this.timeout
    });
  }

  public makeExternalFromSourceName(source: string, version?: string): External {
    return External.fromValue({
      engine: "druid",
      source,
      version,
      suppress: true,

      allowSelectQueries: true,
      allowEternity: false
    });
  }

  public shouldScanSources(): boolean {
    return this.sourceListScan === "auto";
  }
}
