/*
 * Copyright 2017-2022 Allegro.pl
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
import { isQueryable, QueryableDataCube } from "../../../common/models/data-cube/queryable-data-cube";
import { getDataCube, Sources } from "../../../common/models/sources/sources";
import { checkAccess } from "../datacube-guard/datacube-guard";
import { AccessDeniedError, InvalidRequestError } from "../request-errors/request-errors";
import { SettingsManager } from "../settings-manager/settings-manager";

export async function parseDataCube(req: Request, settings: Pick<SettingsManager, "getSources">): Promise<QueryableDataCube> {
  const dataCube = req.body.dataCube || req.body.dataCubeName || req.body.dataSource; // back compatibility
  if (typeof dataCube !== "string") {
    throw new InvalidRequestError("must have a dataCube");
  }
  let sources: Sources;
  try {
    sources = await settings.getSources();
  } catch (e) {
    throw new InvalidRequestError("Couldn't load settings");
  }
  const myDataCube = getDataCube(sources, dataCube);
  if (!myDataCube) {
    throw new InvalidRequestError("unknown data cube");
  }

  if (!isQueryable(myDataCube)) {
    throw new InvalidRequestError("un queryable data cube");
  }

  if (!(checkAccess(myDataCube, req.headers))) {
    throw new AccessDeniedError("access denied");
  }

  return myDataCube;
}
