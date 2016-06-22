import { Class, Instance, isInstanceOf } from 'immutable-class';
import { External } from 'plywood';
import { ensureOneOf } from '../../utils/general/general';

export type SupportedType = 'druid' | 'mysql' | 'postgres';
export type SourceListScan = 'disable' | 'auto';

export interface ClusterValue {
  name: string;
  type: SupportedType;
  host?: string;
  version?: string;
  timeout?: number;
  sourceListScan?: SourceListScan;
  sourceListRefreshOnLoad?: boolean;
  sourceListRefreshInterval?: number;
  sourceReintrospectOnLoad?: boolean;
  sourceReintrospectInterval?: number;

  introspectionStrategy?: string;
  requestDecorator?: string;
  decoratorOptions?: any;

  database?: string;
  user?: string;
  password?: string;
}

export interface ClusterJS {
  name: string;
  type: SupportedType;
  host?: string;
  version?: string;
  timeout?: number;
  sourceListScan?: SourceListScan;
  sourceListRefreshOnLoad?: boolean;
  sourceListRefreshInterval?: number;
  sourceReintrospectOnLoad?: boolean;
  sourceReintrospectInterval?: number;

  introspectionStrategy?: string;
  requestDecorator?: string;
  decoratorOptions?: any;

  database?: string;
  user?: string;
  password?: string;
}

function parseIntFromPossibleString(x: any) {
  return typeof x === 'string' ? parseInt(x, 10) : x;
}

var check: Class<ClusterValue, ClusterJS>;
export class Cluster implements Instance<ClusterValue, ClusterJS> {
  static TYPE_VALUES: SupportedType[] = ['druid', 'mysql', 'postgres'];
  static DEFAULT_TIMEOUT = 40000;
  static DEFAULT_SOURCE_LIST_REFRESH_INTERVAL = 15000;
  static DEFAULT_SOURCE_REINTROSPECT_INTERVAL = 120000;
  static DEFAULT_INTROSPECTION_STRATEGY = 'segment-metadata-fallback';
  static DEFAULT_SOURCE_LIST_SCAN: SourceListScan = 'disable';
  static SOURCE_LIST_SCAN_VALUES: SourceListScan[] = ['disable', 'auto'];

  static isCluster(candidate: any): candidate is Cluster {
    return isInstanceOf(candidate, Cluster);
  }

  static fromJS(parameters: ClusterJS): Cluster {
    var {
      name,
      type,
      host,
      version,
      timeout,
      sourceListScan,
      sourceListRefreshOnLoad,
      sourceListRefreshInterval,
      sourceReintrospectOnLoad,
      sourceReintrospectInterval,
      introspectionStrategy,
      requestDecorator,
      decoratorOptions,
      database,
      user,
      password
    } = parameters;

    var value: ClusterValue = {
      name,
      type,
      host,
      version,
      timeout: parseIntFromPossibleString(timeout),
      sourceListScan: sourceListScan,
      sourceListRefreshOnLoad: sourceListRefreshOnLoad,
      sourceListRefreshInterval: parseIntFromPossibleString(sourceListRefreshInterval),
      sourceReintrospectOnLoad: sourceReintrospectOnLoad,
      sourceReintrospectInterval: parseIntFromPossibleString(sourceReintrospectInterval),
      introspectionStrategy,
      requestDecorator,
      decoratorOptions,
      database,
      user,
      password
    };
    return new Cluster(value);
  }


  public name: string;
  public type: SupportedType;
  public host: string;
  public version: string;
  public timeout: number;
  public sourceListScan: SourceListScan;
  public sourceListRefreshOnLoad: boolean;
  public sourceListRefreshInterval: number;
  public sourceReintrospectOnLoad: boolean;
  public sourceReintrospectInterval: number;

  // Druid
  public introspectionStrategy: string;
  public requestDecorator: string;
  public decoratorOptions: any;

  // SQLs
  public database: string;
  public user: string;
  public password: string;

  constructor(parameters: ClusterValue) {
    var name = parameters.name;
    if (typeof name !== 'string') throw new Error('must have name');
    if (name === 'native') throw new Error("cluster can not be called 'native'");
    this.name = name;

    this.type = parameters.type;
    ensureOneOf(this.type, Cluster.TYPE_VALUES, `In cluster '${this.name}' type`);

    this.host = parameters.host;

    this.version = parameters.version;

    this.timeout = parameters.timeout;
    this.sourceListScan = parameters.sourceListScan;
    if (this.sourceListScan) ensureOneOf(this.sourceListScan, Cluster.SOURCE_LIST_SCAN_VALUES, `In cluster '${this.name}' sourceListScan`);

    this.sourceListRefreshOnLoad = parameters.sourceListRefreshOnLoad || false;
    this.sourceListRefreshInterval = parameters.sourceListRefreshInterval;
    if (this.sourceListRefreshInterval && this.sourceListRefreshInterval < 1000) {
      throw new Error(`can not set sourceListRefreshInterval to < 1000 (is ${this.sourceListRefreshInterval})`);
    }

    this.sourceReintrospectOnLoad = parameters.sourceReintrospectOnLoad;
    this.sourceReintrospectInterval = parameters.sourceReintrospectInterval;
    if (this.sourceReintrospectInterval && this.sourceReintrospectInterval < 1000) {
      throw new Error(`can not set sourceReintrospectInterval to < 1000 (is ${this.sourceReintrospectInterval})`);
    }

    switch (this.type) {
      case 'druid':
        this.introspectionStrategy = parameters.introspectionStrategy;
        this.requestDecorator = parameters.requestDecorator;
        this.decoratorOptions = parameters.decoratorOptions;
        break;

      case 'mysql':
      case 'postgres':
        if (!parameters.database) throw new Error(`cluster '${name}' must specify a database`);
        this.database = parameters.database;
        this.user = parameters.user;
        this.password = parameters.password;
        break;
    }

  }

  public valueOf(): ClusterValue {
    return {
      name: this.name,
      type: this.type,
      host: this.host,
      version: this.version,
      timeout: this.timeout,
      sourceListScan: this.sourceListScan,
      sourceListRefreshOnLoad: this.sourceListRefreshOnLoad,
      sourceListRefreshInterval: this.sourceListRefreshInterval,
      sourceReintrospectOnLoad: this.sourceReintrospectOnLoad,
      sourceReintrospectInterval: this.sourceReintrospectInterval,
      introspectionStrategy: this.introspectionStrategy,
      requestDecorator: this.requestDecorator,
      decoratorOptions: this.decoratorOptions,
      database: this.database,
      user: this.user,
      password: this.password
    };
  }

  public toJS(): ClusterJS {
    var js: ClusterJS = {
      name: this.name,
      type: this.type
    };
    if (this.host) js.host = this.host;
    if (this.version) js.version = this.version;
    if (this.timeout) js.timeout = this.timeout;
    if (this.sourceListScan) js.sourceListScan = this.sourceListScan;

    if (this.sourceListRefreshOnLoad) js.sourceListRefreshOnLoad = this.sourceListRefreshOnLoad;
    if (this.sourceListRefreshInterval != null) js.sourceListRefreshInterval = this.sourceListRefreshInterval;
    if (this.sourceReintrospectOnLoad) js.sourceReintrospectOnLoad = this.sourceReintrospectOnLoad;
    if (this.sourceReintrospectInterval != null) js.sourceReintrospectInterval = this.sourceReintrospectInterval;

    if (this.introspectionStrategy) js.introspectionStrategy = this.introspectionStrategy;
    if (this.requestDecorator) js.requestDecorator = this.requestDecorator;
    if (this.decoratorOptions) js.decoratorOptions = this.decoratorOptions;

    if (this.database) js.database = this.database;
    if (this.user) js.user = this.user;
    if (this.password) js.password = this.password;
    return js;
  }

  public toJSON(): ClusterJS {
    return this.toJS();
  }

  public toString(): string {
    return `[Cluster ${this.name} (${this.type})]`;
  }

  public equals(other: Cluster): boolean {
    return Cluster.isCluster(other) &&
      this.name === other.name &&
      this.type === other.type &&
      this.host === other.host &&
      this.version === other.version &&
      this.sourceListScan === other.sourceListScan &&
      this.sourceListRefreshOnLoad === other.sourceListRefreshOnLoad &&
      this.sourceListRefreshInterval === other.sourceListRefreshInterval &&
      this.sourceReintrospectOnLoad === other.sourceReintrospectOnLoad &&
      this.sourceReintrospectInterval === other.sourceReintrospectInterval &&
      this.introspectionStrategy === other.introspectionStrategy &&
      this.requestDecorator === other.requestDecorator && // don't compare decoratorOptions
      this.database === other.database &&
      this.user === other.user &&
      this.timeout === other.timeout &&
      this.password === other.password;
  }

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
      version: version,

      allowSelectQueries: true,
      allowEternity: false
    });
  }

  public shouldScanSources(): boolean {
    return this.getSourceListScan() === 'auto';
  }

  public getTimeout(): number {
    return this.timeout || Cluster.DEFAULT_TIMEOUT;
  }

  public getSourceListScan(): SourceListScan {
    return this.sourceListScan || Cluster.DEFAULT_SOURCE_LIST_SCAN;
  }

  public getSourceListRefreshInterval(): number {
    return this.sourceListRefreshInterval != null ? this.sourceListRefreshInterval : Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL;
  }

  public getSourceReintrospectInterval(): number {
    return this.sourceReintrospectInterval != null ? this.sourceReintrospectInterval : Cluster.DEFAULT_SOURCE_REINTROSPECT_INTERVAL;
  }

  public getIntrospectionStrategy(): string {
    return this.introspectionStrategy || Cluster.DEFAULT_INTROSPECTION_STRATEGY;
  }

  change(propertyName: string, newValue: any): Cluster {
    var v = this.valueOf();

    if (!v.hasOwnProperty(propertyName)) {
      throw new Error(`Unknown property : ${propertyName}`);
    }

    (v as any)[propertyName] = newValue;
    return new Cluster(v);
  }

  changeHost(newHost: string): Cluster {
    return this.change('host', newHost);
  }

  changeTimeout(newTimeout: string): Cluster {
    return this.change('timeout', newTimeout);
  }

  changeSourceListRefreshInterval(newSourceListRefreshInterval: string): Cluster {
    return this.change('sourceListRefreshInterval', newSourceListRefreshInterval);
  }
}
check = Cluster;
