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

import { Class, Instance, isInstanceOf, immutableArraysEqual, immutableEqual } from 'immutable-class';
import { ImmutableUtils } from '../../utils/index';
import { Executor, findByName, overrideByName } from 'plywood';
import { hasOwnProperty } from '../../utils/general/general';
import { Cluster, ClusterJS } from '../cluster/cluster';
import { Customization, CustomizationJS } from '../customization/customization';
import { DataCube, DataCubeJS } from  '../data-cube/data-cube';
import { Collection, CollectionJS, CollectionContext } from '../collection/collection';
import { Manifest } from '../manifest/manifest';

export interface AppSettingsValue {
  version?: number;
  clusters?: Cluster[];
  customization?: Customization;
  dataCubes?: DataCube[];
  linkViewConfig?: Collection;
  collections?: Collection[];
}

export interface AppSettingsJS {
  version?: number;
  clusters?: ClusterJS[];
  customization?: CustomizationJS;
  dataCubes?: DataCubeJS[];
  linkViewConfig?: CollectionJS;
  collections?: CollectionJS[];
}

export interface AppSettingsContext {
  visualizations: Manifest[];
  executorFactory?: (dataCube: DataCube) => Executor;
}

var check: Class<AppSettingsValue, AppSettingsJS>;
export class AppSettings implements Instance<AppSettingsValue, AppSettingsJS> {
  static BLANK = AppSettings.fromJS({}, { visualizations: [] });

  static isAppSettings(candidate: any): candidate is AppSettings {
    return isInstanceOf(candidate, AppSettings);
  }

  static fromJS(parameters: AppSettingsJS, context?: AppSettingsContext): AppSettings {
    if (!context) throw new Error('AppSettings must have context');
    var clusters: Cluster[];
    if (parameters.clusters) {
      clusters = parameters.clusters.map(cluster => Cluster.fromJS(cluster));

    } else if (hasOwnProperty(parameters, 'druidHost') || hasOwnProperty(parameters, 'brokerHost')) {
      var clusterJS: any = JSON.parse(JSON.stringify(parameters));
      clusterJS.name = 'druid';
      clusterJS.type = 'druid';
      clusterJS.host = clusterJS.druidHost || clusterJS.brokerHost;
      clusters = [Cluster.fromJS(clusterJS)];

    } else {
      clusters = [];
    }

    var executorFactory = context.executorFactory;
    var dataCubes = (parameters.dataCubes || (parameters as any).dataSources || []).map((dataCubeJS: DataCubeJS) => {
      var dataCubeClusterName = dataCubeJS.clusterName || (dataCubeJS as any).engine;
      if (dataCubeClusterName !== 'native') {
        var cluster = findByName(clusters, dataCubeClusterName);
        if (!cluster) throw new Error(`Can not find cluster '${dataCubeClusterName}' for data cube '${dataCubeJS.name}'`);
      }

      var dataCubeObject = DataCube.fromJS(dataCubeJS, { cluster });
      if (executorFactory) {
        var executor = executorFactory(dataCubeObject);
        if (executor) dataCubeObject = dataCubeObject.attachExecutor(executor);
      }
      return dataCubeObject;
    });

    var collectionContext = { dataCubes, visualizations: context.visualizations };
    var makeCollection = (js: CollectionJS) => {
      return js ? Collection.fromJS(js, collectionContext) : null;
    };

    var value: AppSettingsValue = {
      version: parameters.version,
      clusters,
      customization: Customization.fromJS(parameters.customization || {}),
      dataCubes,
      linkViewConfig: makeCollection(parameters.linkViewConfig),
      collections: parameters.collections ? parameters.collections.map(makeCollection).filter(Boolean) : []
    };

    return new AppSettings(value);
  }

  public version: number;
  public clusters: Cluster[];
  public customization: Customization;
  public dataCubes: DataCube[];
  public linkViewConfig: Collection;
  public collections: Collection[];

  constructor(parameters: AppSettingsValue) {
    const {
      version,
      clusters,
      customization,
      dataCubes,
      linkViewConfig,
      collections
    } = parameters;

    for (var dataCube of dataCubes) {
      if (dataCube.clusterName === 'native') continue;
      if (!findByName(clusters, dataCube.clusterName)) {
        throw new Error(`data cube ${dataCube.name} refers to an unknown cluster ${dataCube.clusterName}`);
      }
    }

    this.version = version || 0;
    this.clusters = clusters;
    this.customization = customization;
    this.dataCubes = dataCubes;
    this.linkViewConfig = linkViewConfig;
    this.collections = collections;
  }

  public valueOf(): AppSettingsValue {
    return {
      version: this.version,
      clusters: this.clusters,
      customization: this.customization,
      dataCubes: this.dataCubes,
      linkViewConfig: this.linkViewConfig,
      collections: this.collections
    };
  }

  public toJS(): AppSettingsJS {
    var js: AppSettingsJS = {};
    if (this.version) js.version = this.version;
    js.clusters = this.clusters.map(cluster => cluster.toJS());
    js.customization = this.customization.toJS();
    js.dataCubes = this.dataCubes.map(dataCube => dataCube.toJS());
    if (this.collections.length > 0) js.collections = this.collections.map(c => c.toJS());
    if (this.linkViewConfig) js.linkViewConfig = this.linkViewConfig.toJS();
    return js;
  }

  public toJSON(): AppSettingsJS {
    return this.toJS();
  }

  public toString(): string {
    return `[AppSettings v${this.version} dataCubes=${this.dataCubes.length}]`;
  }

  public equals(other: AppSettings): boolean {
    return AppSettings.isAppSettings(other) &&
      this.version === other.version &&
      immutableArraysEqual(this.clusters, other.clusters) &&
      immutableEqual(this.customization, other.customization) &&
      immutableArraysEqual(this.dataCubes, other.dataCubes) &&
      Boolean(this.linkViewConfig) === Boolean(other.linkViewConfig) &&
      immutableArraysEqual(this.collections, other.collections);
  }

  public toClientSettings(): AppSettings {
    var value = this.valueOf();

    value.clusters = value.clusters.map((c) => c.toClientCluster());

    value.dataCubes = value.dataCubes
      .filter((ds) => ds.isQueryable())
      .map((ds) => ds.toClientDataCube());

    return new AppSettings(value);
  }

  public getVersion(): number {
    return this.version;
  }

  public getDataCubesForCluster(clusterName: string): DataCube[] {
    return this.dataCubes.filter(dataCube => dataCube.clusterName === clusterName);
  }

  public getDataCube(dataCubeName: string): DataCube {
    return findByName(this.dataCubes, dataCubeName);
  }

  public addOrUpdateDataCube(dataCube: DataCube): AppSettings {
    var value = this.valueOf();
    value.dataCubes = overrideByName(value.dataCubes, dataCube);
    return new AppSettings(value);
  }

  public addOrUpdateCollection(collection: Collection): AppSettings {
    var value = this.valueOf();
    value.collections = overrideByName(value.collections, collection);
    return new AppSettings(value);
  }

  public deleteCollection(collection: Collection): AppSettings {
    var value = this.valueOf();
    var index = value.collections.indexOf(collection);

    if (index === -1) {
      throw new Error(`Unknown collection : ${collection.toString()}`);
    }

    var newCollections = value.collections.concat();
    newCollections.splice(index, 1);

    value.collections = newCollections;
    return new AppSettings(value);
  }

  public addCollectionAt(collection: Collection, index: number): AppSettings {
    var value = this.valueOf();

    var newCollections = value.collections.concat();
    newCollections.splice(index, 0, collection);

    value.collections = newCollections;
    return new AppSettings(value);
  }

  public attachExecutors(executorFactory: (dataCube: DataCube) => Executor): AppSettings {
    var value = this.valueOf();
    value.dataCubes = value.dataCubes.map((ds) => {
      var executor = executorFactory(ds);
      if (executor) ds = ds.attachExecutor(executor);
      return ds;
    });
    return new AppSettings(value);
  }

  changeCustomization(customization: Customization): AppSettings {
    return this.change('customization', customization);
  }

  changeClusters(clusters: Cluster[]): AppSettings {
    return this.change('clusters', clusters);
  }

  addCluster(cluster: Cluster): AppSettings {
    return this.changeClusters(overrideByName(this.clusters, cluster));
  }

  change(propertyName: string, newValue: any): AppSettings {
    return ImmutableUtils.change(this, propertyName, newValue);
  }

  changeDataCubes(dataCubes: DataCube[]): AppSettings {
    return this.change('dataCubes', dataCubes);
  }

  changeCollections(collections: Collection[]): AppSettings {
    return this.change('collections', collections);
  }

  addDataCube(dataCube: DataCube): AppSettings {
    return this.changeDataCubes(overrideByName(this.dataCubes, dataCube));
  }

  filterDataCubes(fn: (dataCube: DataCube, index?: number, dataCubes?: DataCube[]) => boolean): AppSettings {
    var value = this.valueOf();
    value.dataCubes = value.dataCubes.filter(fn);
    return new AppSettings(value);
  }

}
check = AppSettings;
