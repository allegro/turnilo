/*
 * Copyright 2017-2021 Allegro.pl
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
import { ClientAppSettings } from "../app-settings/app-settings";
import { Cluster, ClusterJS } from "../cluster/cluster";
import { findCluster } from "../cluster/find-cluster";
import { DataCube, DataCubeJS } from "../data-cube/data-cube";

export interface SourcesJS {
  clusters?: ClusterJS[];
  dataCubes?: DataCubeJS[];
}

export interface Sources {
  readonly clusters: Cluster[];
  readonly dataCubes: DataCube[];
}

export interface SerializedSources {
  clusters: ClusterJS[]; // SerializedCluster[]
  dataCubes: DataCubeJS[]; // SerializedDataCube[]
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

export function fromConfig(config: SourcesJS): Sources {
  const clusters = readClusters(config);
  const dataCubes = readDataCubes(config, clusters);

  return {
    clusters,
    dataCubes
  };
}

export function serialize({
                                   clusters: serverClusters,
                                   dataCubes: serverDataCubes
                                 }: Sources): SerializedSources {
  const clusters = serverClusters.map(c => c.toClientCluster().toJS());

  const dataCubes = serverDataCubes
    .filter(ds => ds.isQueryable())
    .map(ds => ds.toClientDataCube().toJS());

  return {
    clusters,
    dataCubes
  };
}

export function deserialize(settings: SerializedSources, appSettings: ClientAppSettings): Sources {
  const clusters = settings.clusters.map(cluster => Cluster.fromJS(cluster));

  const dataCubes = settings.dataCubes.map((dataCubeJS: DataCubeJS) => {
    const cluster = findCluster(dataCubeJS, clusters);
    let dataCubeObject = DataCube.fromJS(dataCubeJS, { cluster });
    const executor = Ajax.queryUrlExecutorFactory(dataCubeObject.name, appSettings);
    dataCubeObject = dataCubeObject.attachExecutor(executor);
    return dataCubeObject;
  });

  return {
    clusters,
    dataCubes
  };
}

export function getDataCubesForCluster(sources: Sources, clusterName: string): DataCube[] {
  return sources.dataCubes.filter(dataCube => dataCube.clusterName === clusterName);
}

export function getDataCube(sources: Sources, dataCubeName: string): DataCube {
  return NamedArray.findByName(sources.dataCubes, dataCubeName);
}

export function addOrUpdateDataCube(sources: Sources, dataCube: DataCube): Sources {
  const dataCubes = NamedArray.overrideByName(sources.dataCubes, dataCube);
  return {
    ...sources,
    dataCubes
  };
}

export function deleteDataCube(sources: Sources, dataCube: DataCube): Sources {
  return {
    ...sources,
    dataCubes: sources.dataCubes.filter(dc => dc.equals(dataCube))
  };
}
