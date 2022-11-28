/*
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

import { Request } from "express";
import { DataCube } from "../../../common/models/data-cube/data-cube";

export const allowDataCubesHeaderName = "x-turnilo-allow-datacubes";

export function checkAccess(dataCube: DataCube, headers: Request["headers"]) {
  const guard = dataCube && dataCube.cluster && dataCube.cluster.guardDataCubes || false;

  if (!guard) {
    return true;
  }

  if (!(allowDataCubesHeaderName in headers)) {
    return false;
  }

  const allowed_datasources = (headers[allowDataCubesHeaderName] as string).split(",");
  return  allowed_datasources.indexOf("*") > -1 || allowed_datasources.indexOf(dataCube.name) > -1;
}
