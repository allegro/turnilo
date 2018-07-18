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

import { BaseImmutable, Property } from "immutable-class";
import { External } from "plywood";
import { verifyUrlSafeName } from "../../utils/general/general";

export type SupportedType = "druid";
export type SourceListScan = "disable" | "auto";
export type Protocol = "plain" | "tls-loose" | "tls";

export interface ClusterValue {
  name: string;
  type: SupportedType;
  title?: string;
  host?: string;
  version?: string;
  timeout?: number;
  healthCheckTimeout?: number;
  sourceListScan?: SourceListScan;
  sourceListRefreshOnLoad?: boolean;
  sourceListRefreshInterval?: number;
  sourceReintrospectOnLoad?: boolean;
  sourceReintrospectInterval?: number;

  introspectionStrategy?: string;
  requestDecorator?: string;
  decoratorOptions?: any;
  protocol?: Protocol;

  database?: string;
  user?: string;
  password?: string;
}

export interface ClusterJS {
  name: string;
  type: SupportedType;
  title?: string;
  host?: string;
  version?: string;
  timeout?: number;
  healthCheckTimeout?: number;
  sourceListScan?: SourceListScan;
  sourceListRefreshOnLoad?: boolean;
  sourceListRefreshInterval?: number;
  sourceReintrospectOnLoad?: boolean;
  sourceReintrospectInterval?: number;

  introspectionStrategy?: string;
  requestDecorator?: string;
  decoratorOptions?: any;
  protocol?: Protocol;

  database?: string;
  user?: string;
  password?: string;
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

export class Cluster extends BaseImmutable<ClusterValue, ClusterJS> {
  static TYPE_VALUES: SupportedType[] = ["druid"];
  static DEFAULT_TIMEOUT = 40000;
  static DEFAULT_HEALTH_CHECK_TIMEOUT = 1000;
  static DEFAULT_SOURCE_LIST_SCAN: SourceListScan = "auto";
  static SOURCE_LIST_SCAN_VALUES: SourceListScan[] = ["disable", "auto"];
  static DEFAULT_SOURCE_LIST_REFRESH_INTERVAL = 0;
  static DEFAULT_SOURCE_LIST_REFRESH_ON_LOAD = false;
  static DEFAULT_SOURCE_REINTROSPECT_INTERVAL = 0;
  static DEFAULT_SOURCE_REINTROSPECT_ON_LOAD = false;
  static DEFAULT_INTROSPECTION_STRATEGY = "segment-metadata-fallback";
  static DEFAULT_PROTOCOL_TYPE = "plain";

  static isCluster(candidate: any): candidate is Cluster {
    return candidate instanceof Cluster;
  }

  static fromJS(parameters: ClusterJS): Cluster {
    if (!parameters.host && ((parameters as any).druidHost || (parameters as any).brokerHost)) {
      parameters.host = (parameters as any).druidHost || (parameters as any).brokerHost;
    }
    if (typeof parameters.timeout === "string") {
      parameters.timeout = parseInt(parameters.timeout, 10);
    }
    if (typeof parameters.sourceListRefreshInterval === "string") {
      parameters.sourceListRefreshInterval = parseInt(parameters.sourceListRefreshInterval, 10);
    }
    if (typeof parameters.sourceReintrospectInterval === "string") {
      parameters.sourceReintrospectInterval = parseInt(parameters.sourceReintrospectInterval, 10);
    }
    return new Cluster(BaseImmutable.jsToValue(Cluster.PROPERTIES, parameters));
  }

  static PROPERTIES: Property[] = [
    { name: "name", validate: [verifyUrlSafeName, ensureNotNative] },
    { name: "type", possibleValues: Cluster.TYPE_VALUES },
    { name: "host", defaultValue: null },
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

    // Druid
    { name: "introspectionStrategy", defaultValue: Cluster.DEFAULT_INTROSPECTION_STRATEGY },
    { name: "requestDecorator", defaultValue: null },
    { name: "decoratorOptions", defaultValue: null },
    { name: "protocol", defaultValue: Cluster.DEFAULT_PROTOCOL_TYPE },

    // SQLs
    { name: "database", defaultValue: null },
    { name: "user", defaultValue: null },
    { name: "password", defaultValue: null }
  ];

  public name: string;
  public type: SupportedType;
  public host: string;
  public title: string;
  public version: string;
  public timeout: number;
  public healthCheckTimeout: number;
  public sourceListScan: SourceListScan;
  public sourceListRefreshOnLoad: boolean;
  public sourceListRefreshInterval: number;
  public sourceReintrospectOnLoad: boolean;
  public sourceReintrospectInterval: number;

  // Druid
  public introspectionStrategy: string;
  public requestDecorator: string;
  public decoratorOptions: any;
  public protocol: Protocol;

  // SQLs
  public database: string;
  public user: string;
  public password: string;

  constructor(parameters: ClusterValue) {
    super(parameters);

    switch (this.type) {
      case "druid":
        this.database = null;
        this.user = null;
        this.password = null;
        this.protocol = null;
        break;
    }

  }

  public getTimeout: () => number;
  public getSourceListScan: () => SourceListScan;
  public getSourceListRefreshInterval: () => number;
  public getSourceReintrospectInterval: () => number;
  public getIntrospectionStrategy: () => string;
  public changeHost: (newHost: string) => Cluster;
  public changeTimeout: (newTimeout: string) => Cluster;
  public changeSourceListRefreshInterval: (newSourceListRefreshInterval: string) => Cluster;

  public toClientCluster(): Cluster {
    return new Cluster({
      name: this.name,
      type: this.type
    });
  }

  public makeExternalFromSourceName(source: string, version?: string): External {
    return External.fromValue({
      engine: this.type,
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
