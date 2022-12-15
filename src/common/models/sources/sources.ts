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
import { Logger } from "../../logger/logger";
import { isTruthy } from "../../utils/general/general";
import {
  ClientCluster,
  Cluster,
  ClusterJS,
  fromConfig as clusterFromConfig,
  serialize as serializeCluster,
  SerializedCluster
} from "../cluster/cluster";
import { findCluster } from "../cluster/find-cluster";
import {
  ClientDataCube,
  DataCube,
  DataCubeJS,
  fromConfig as dataCubeFromConfig,
  serialize as serializeDataCube,
  SerializedDataCube
} from "../data-cube/data-cube";
import { isQueryable, QueryableDataCube } from "../data-cube/queryable-data-cube";

export interface SourcesJS {
  clusters?: ClusterJS[];
  dataCubes?: DataCubeJS[];
}

export interface Sources {
  readonly clusters: Cluster[];
  readonly dataCubes: DataCube[];
}

export interface SerializedSources {
  clusters: SerializedCluster[];
  dataCubes: SerializedDataCube[];
}

export interface ClientSources {
  readonly clusters: ClientCluster[];
  readonly dataCubes: ClientDataCube[];
}

interface ClustersConfig {
  clusters?: ClusterJS[];
  druidHost?: string;
  brokerHost?: string;
}

function readClusters({ clusters, druidHost, brokerHost }: ClustersConfig, logger: Logger): Cluster[] {
  if (Array.isArray(clusters)) return clusters.map(cluster => clusterFromConfig(cluster, logger));
  if (isTruthy(druidHost) || isTruthy(brokerHost)) {
    return [clusterFromConfig({
      name: "druid",
      url: druidHost || brokerHost
    }, logger)];
  }
  return [];
}

interface DataCubesConfig {
  dataCubes?: DataCubeJS[];
  dataSources?: DataCubeJS[];
}

function readDataCubes({ dataCubes, dataSources }: DataCubesConfig, clusters: Cluster[], logger: Logger): DataCube[] {
  const cubes = dataCubes || dataSources || [];
  return cubes.map(cube => {
    const cluster = findCluster(cube, clusters);
    return dataCubeFromConfig(cube, cluster, logger);
  });
}

export function fromConfig(config: SourcesJS, logger: Logger): Sources {
  const clusters = readClusters(config, logger);
  const dataCubes = readDataCubes(config, clusters, logger);

  return {
    clusters,
    dataCubes
  };
}

export function serialize({
                            clusters: serverClusters,
                            dataCubes: serverDataCubes
                          }: Sources): SerializedSources {
  const clusters = serverClusters.map(serializeCluster);

  const dataCubes = serverDataCubes
    .filter(dc => isQueryable(dc))
    .map(serializeDataCube);

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

export function addOrUpdateDataCube(sources: Sources, dataCube: QueryableDataCube): Sources {
  const dataCubes = NamedArray.overrideByName(sources.dataCubes, dataCube);
  return {
    ...sources,
    dataCubes
  };
}

export function deleteDataCube(sources: Sources, dataCube: DataCube): Sources {
  return {
    ...sources,
    dataCubes: sources.dataCubes.filter(dc => dc.name !== dataCube.name)
  };
}
