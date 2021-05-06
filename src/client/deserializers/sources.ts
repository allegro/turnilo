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

import { ClientAppSettings } from "../../common/models/app-settings/app-settings";
import { Cluster } from "../../common/models/cluster/cluster";
import { findCluster } from "../../common/models/cluster/find-cluster";
import { DataCube, DataCubeJS } from "../../common/models/data-cube/data-cube";
import { SerializedSources, Sources } from "../../common/models/sources/sources";
import { Ajax } from "../utils/ajax/ajax";

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
