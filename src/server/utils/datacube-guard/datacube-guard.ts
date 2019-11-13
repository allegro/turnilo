/*
 * Copyright 2019 Wirtualna Polska Media S.A.
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

import { DataCube } from "../../../common/models/data-cube/data-cube";
import { Request } from "express";
import { DataCubeFixtures } from "../../../common/models/data-cube/data-cube.fixtures";


export function checkAccess(dataCube: DataCube, req: Request) {
  var guard = dataCube && dataCube.cluster && dataCube.cluster.guardDataCubes || false;

  if (!guard) {
    return true;
  }

  if (!("x-turnilo-allow-datacubes" in req.headers)) {
    return false;
  }

  const allowed_datasources = (req.headers["x-turnilo-allow-datacubes"] as string).split(",");
  return  allowed_datasources.indexOf("*") > -1 || allowed_datasources.indexOf(dataCube.name) > -1;

}