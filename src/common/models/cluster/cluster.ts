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

import { BackCompat, BaseImmutable, Property } from "immutable-class";
import { External } from "plywood";
import { URL } from "url";
import { isTruthy, verifyUrlSafeName } from "../../utils/general/general";

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
  requestDecorator?: string;
  decoratorOptions?: any;
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
  requestDecorator?: string;
  decoratorOptions?: any;
}

function ensureNotNative(name: string): void {
  if (name === "native") {
    throw new Error("can not be 'native'");
  }
}

function ensureNotTiny(v: number): void {
  if (v === 0) return;
  if (v < 1000) {
    throw new Error(`can not be < 1000 (is ${v})`);
  }
}

function validateUrl(url: string): void {
  try {
    new URL(url);
  } catch (e) {
    throw new Error(`Cluster url: ${url} has invalid format. It should be http[s]://hostname[:port]`);
  }
}

function oldHostParameter(cluster: any): string {
  return cluster.host || cluster.druidHost || cluster.brokerHost;
}

export class Cluster extends BaseImmutable<ClusterValue, ClusterJS> {
  static DEFAULT_TIMEOUT = 40000;
  static DEFAULT_HEALTH_CHECK_TIMEOUT = 1000;
  static DEFAULT_SOURCE_LIST_SCAN: SourceListScan = "auto";
  static SOURCE_LIST_SCAN_VALUES: SourceListScan[] = ["disable", "auto"];
  static DEFAULT_SOURCE_LIST_REFRESH_INTERVAL = 0;
  static DEFAULT_SOURCE_LIST_REFRESH_ON_LOAD = true;
  static DEFAULT_SOURCE_REINTROSPECT_INTERVAL = 0;
  static DEFAULT_SOURCE_REINTROSPECT_ON_LOAD = true;
  static DEFAULT_INTROSPECTION_STRATEGY = "segment-metadata-fallback";
  static DEFAULT_GUARD_DATA_CUBES = false;

  static fromJS(parameters: ClusterJS): Cluster {
    if (typeof parameters.timeout === "string") {
      parameters.timeout = parseInt(parameters.timeout, 10);
    }
    if (typeof parameters.sourceListRefreshInterval === "string") {
      parameters.sourceListRefreshInterval = parseInt(parameters.sourceListRefreshInterval, 10);
    }
    if (typeof parameters.sourceReintrospectInterval === "string") {
      parameters.sourceReintrospectInterval = parseInt(parameters.sourceReintrospectInterval, 10);
    }
    return new Cluster(BaseImmutable.jsToValue(Cluster.PROPERTIES, parameters, Cluster.BACKWARD_COMPATIBILITY));
  }

  static PROPERTIES: Property[] = [
    { name: "name", validate: [verifyUrlSafeName, ensureNotNative] },
    { name: "url", defaultValue: null, validate: [validateUrl] },
    { name: "title", defaultValue: "" },
    { name: "version", defaultValue: null },
    { name: "timeout", defaultValue: Cluster.DEFAULT_TIMEOUT },
    { name: "healthCheckTimeout", defaultValue: Cluster.DEFAULT_HEALTH_CHECK_TIMEOUT },
    { name: "sourceListScan", defaultValue: Cluster.DEFAULT_SOURCE_LIST_SCAN, possibleValues: Cluster.SOURCE_LIST_SCAN_VALUES },
    { name: "sourceListRefreshOnLoad", defaultValue: Cluster.DEFAULT_SOURCE_LIST_REFRESH_ON_LOAD },
    {
      name: "sourceListRefreshInterval",
      defaultValue: Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL,
      validate: [BaseImmutable.ensure.number, ensureNotTiny]
    },
    { name: "sourceReintrospectOnLoad", defaultValue: Cluster.DEFAULT_SOURCE_REINTROSPECT_ON_LOAD },
    {
      name: "sourceReintrospectInterval",
      defaultValue: Cluster.DEFAULT_SOURCE_REINTROSPECT_INTERVAL,
      validate: [BaseImmutable.ensure.number, ensureNotTiny]
    },
    { name: "introspectionStrategy", defaultValue: Cluster.DEFAULT_INTROSPECTION_STRATEGY },
    { name: "requestDecorator", defaultValue: null },
    { name: "decoratorOptions", defaultValue: null },
    { name: "guardDataCubes", defaultValue: Cluster.DEFAULT_GUARD_DATA_CUBES }
  ];

  static HTTP_PROTOCOL_TEST = /^http(s?):/;

  static BACKWARD_COMPATIBILITY: BackCompat[] = [{
    condition: cluster => !isTruthy(cluster.url) && isTruthy(oldHostParameter(cluster)),
    action: cluster => {
      const oldHost = oldHostParameter(cluster);
      cluster.url = Cluster.HTTP_PROTOCOL_TEST.test(oldHost) ? oldHost : `http://${oldHost}`;
    }
  }];

  public type = "druid";

  public name: string;
  public url: string;
  public title: string;
  public version: string;
  public timeout: number;
  public healthCheckTimeout: number;
  public sourceListScan: SourceListScan;
  public sourceListRefreshOnLoad: boolean;
  public sourceListRefreshInterval: number;
  public sourceReintrospectOnLoad: boolean;
  public sourceReintrospectInterval: number;
  public guardDataCubes: boolean;

  // Druid
  public introspectionStrategy: string;
  public requestDecorator: string;
  public decoratorOptions: any;

  public getTimeout: () => number;
  public getSourceListScan: () => SourceListScan;
  public getSourceListRefreshInterval: () => number;
  public getSourceReintrospectInterval: () => number;
  public getIntrospectionStrategy: () => string;
  public changeUrl: (newUrl: string) => Cluster;
  public changeTimeout: (newTimeout: string) => Cluster;
  public changeSourceListRefreshInterval: (newSourceListRefreshInterval: string) => Cluster;

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
    return this.getSourceListScan() === "auto";
  }
}

BaseImmutable.finalize(Cluster);
