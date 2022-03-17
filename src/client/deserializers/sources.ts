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
import { SerializedDataCube } from "../../common/models/data-cube/data-cube";
import { ClientSources, SerializedSources } from "../../common/models/sources/sources";
import { Ajax } from "../utils/ajax/ajax";
import { deserialize as deserializeCluster } from "./cluster";
import { deserialize as deserializeDataCube } from "./data-cube";

export function deserialize(settings: SerializedSources, appSettings: ClientAppSettings): ClientSources {
  const clusters = settings.clusters.map(deserializeCluster);

  const dataCubes = settings.dataCubes.map((dataCube: SerializedDataCube) => {
    const executor = Ajax.queryUrlExecutorFactory(dataCube.name, appSettings);
    return deserializeDataCube(dataCube, executor);
  });

  return {
    clusters,
    dataCubes
  };
}
