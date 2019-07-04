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

export function checkAccess(dataCube: any, req: any) {
  var guard = dataCube.cluster.guardDataCubes || false;

  if (!guard) {
    return true;
  }

  if ("headers" in this) {
    req =  this;
  }

  if (!("x-turnilo-allow-datacubes" in req.headers)) {
    return false;
  }

  var allowed_datasources = (<string> req.headers["x-turnilo-allow-datacubes"]).split(",");
  return  allowed_datasources.indexOf(dataCube.name) > -1 ||  allowed_datasources.indexOf("*") > -1;
}
