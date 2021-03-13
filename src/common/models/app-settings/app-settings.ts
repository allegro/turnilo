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

import { NamedArray } from "immutable-class";
import { Ajax } from "../../../client/utils/ajax/ajax";
import { isTruthy } from "../../utils/general/general";
import { Cluster, ClusterJS } from "../cluster/cluster";
import { findCluster } from "../cluster/find-cluster";
import { Customization, CustomizationJS } from "../customization/customization";
import { DataCube, DataCubeJS } from "../data-cube/data-cube";

const DEFAULT_CLIENT_TIMEOUT = 0;

interface AppSettingsYAML {
  version?: number;
  clientTimeout?: number;
  clusters?: ClusterJS[];
  customization?: CustomizationJS;
  dataCubes?: DataCubeJS[];
}

export interface ServerAppSettings {
  readonly version: number;
  readonly clientTimeout: number;
  readonly clusters: Cluster[];
  readonly customization: Customization;
  readonly dataCubes: DataCube[];
}

export interface SerializedClientAppSettings {
  version: number;
  clientTimeout: number;
  clusters: ClusterJS[];
  customization: CustomizationJS;
  dataCubes: DataCubeJS[];
}

export interface ClientAppSettings {
  version: number;
  clientTimeout: number;
  clusters: Cluster[];
  customization: Customization;
  dataCubes: DataCube[];
}

interface ClustersConfig {
  clusters?: ClusterJS[];
  druidHost?: string;
  brokerHost?: string;
}

function readClusters({ clusters, druidHost, brokerHost }: ClustersConfig): Cluster[] {
  if (Array.isArray(clusters)) return clusters.map(cluster => Cluster.fromJS(cluster));
  if (isTruthy(druidHost) || isTruthy(brokerHost)) {
    return [Cluster.fromJS({
      name: "druid",
      url: druidHost || brokerHost
    })];
  }
  return [];
}

interface DataCubesConfig {
  dataCubes?: DataCubeJS[];
  dataSources?: DataCubeJS[];
}

function readDataCubes({ dataCubes, dataSources }: DataCubesConfig, clusters: Cluster[]): DataCube[] {
  const cubes = dataCubes || dataSources || [];
  return cubes.map(cube => {
    const cluster = findCluster(cube, clusters);
    return DataCube.fromJS(cube, { cluster });
  });
}

export function fromConfig(config: AppSettingsYAML): ServerAppSettings {
  const clusters = readClusters(config);
  const clientTimeout = config.clientTimeout === undefined ? DEFAULT_CLIENT_TIMEOUT : config.clientTimeout;
  const dataCubes = readDataCubes(config, clusters);
  const version = config.version || 0;
  const customization = Customization.fromJS(config.customization || {});

  // make part of Customization server side smart constructor
  customization.validate();

  return {
    clientTimeout,
    clusters,
    dataCubes,
    version,
    customization
  };
}

export const BLANK_SETTINGS: ServerAppSettings = fromConfig({});

export function toClientSettings({
                                   customization: serverCustomization,
                                   version,
                                   clusters: serverClusters,
                                   clientTimeout,
                                   dataCubes: serverDataCubes
                                 }: ServerAppSettings): SerializedClientAppSettings {
  const clusters = serverClusters.map(c => c.toClientCluster().toJS());

  const dataCubes = serverDataCubes
    .filter(ds => ds.isQueryable())
    .map(ds => ds.toClientDataCube().toJS());

  const customization = serverCustomization.toJS();

  return {
    clusters,
    dataCubes,
    version,
    clientTimeout,
    customization
  };
}

export function fromJS(settings: SerializedClientAppSettings): ClientAppSettings {

  const version = settings.version;
  const clientTimeout = settings.clientTimeout;
  const customization = Customization.fromJS(settings.customization);
  const clusters = settings.clusters.map(cluster => Cluster.fromJS(cluster));

  const dataCubes = settings.dataCubes.map((dataCubeJS: DataCubeJS) => {
    const cluster = findCluster(dataCubeJS, clusters);
    let dataCubeObject = DataCube.fromJS(dataCubeJS, { cluster });
    const executor = Ajax.queryUrlExecutorFactory(dataCubeObject.name, clientTimeout);
    dataCubeObject = dataCubeObject.attachExecutor(executor);
    return dataCubeObject;
  });

  return {
    version,
    clusters,
    clientTimeout,
    customization,
    dataCubes
  };
}

export function getDataCubesForCluster(settings: ServerAppSettings, clusterName: string): DataCube[] {
  return settings.dataCubes.filter(dataCube => dataCube.clusterName === clusterName);
}

export function getDataCube(settings: ServerAppSettings, dataCubeName: string): DataCube {
  return NamedArray.findByName(settings.dataCubes, dataCubeName);
}

export function addOrUpdateDataCube(settings: ServerAppSettings, dataCube: DataCube): ServerAppSettings {
  const dataCubes = NamedArray.overrideByName(settings.dataCubes, dataCube);
  return {
    ...settings,
    dataCubes
  };
}

export function deleteDataCube(settings: ServerAppSettings, dataCube: DataCube): ServerAppSettings {
  return {
    ...settings,
    dataCubes: settings.dataCubes.filter(dc => dc.equals(dataCube))
  };
}

