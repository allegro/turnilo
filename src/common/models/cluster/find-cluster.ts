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
import { DataCubeJS } from "../data-cube/data-cube";
import { Cluster } from "./cluster";

export function findCluster(dataCube: DataCubeJS, clusters: Cluster[]): Cluster | undefined {
  const name = dataCube.clusterName || (dataCube as any).engine;
  // TODO: Native clusters should have stub object to return there
  if (name === "native") return undefined;
  const cluster = NamedArray.findByName(clusters, name);
  if (!cluster) throw new Error(`Can not find cluster '${name}' for data cube '${dataCube.name}'`);
  return cluster;
}
