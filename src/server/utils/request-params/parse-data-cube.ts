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
import { isNil } from "../../../common/utils/general/general";
import { checkAccess } from "../datacube-guard/datacube-guard";
import { AccessDeniedError, InvalidRequestError } from "../request-errors/request-errors";
import { SettingsManager } from "../settings-manager/settings-manager";

const RESTRICTED_PATHS = ["/plywood", "/query"];

function verifyAccess(req: Request, dataCube: QueryableDataCube): boolean {
  const path = req.path;
  const isRestrictedPath = RESTRICTED_PATHS.some(prefix => path.startsWith(prefix));
  if (!isRestrictedPath) return true;

  return checkAccess(dataCube, req.headers);
}

export async function parseDataCube(req: Request, settings: Pick<SettingsManager, "getSources">): Promise<QueryableDataCube> {
  const dataCubeName = req.body.dataCube || req.body.dataCubeName || req.body.dataSource; // back compatibility
  if (isNil(dataCubeName)) {
    throw new InvalidRequestError("Parameter dataCube is required");
  }
  if (typeof dataCubeName !== "string") {
    throw new InvalidRequestError(`Expected dataCube to be a string, got: ${typeof dataCubeName}`);
  }
  let sources: Sources;
  try {
    sources = await settings.getSources();
  } catch (e) {
    throw new InvalidRequestError("Couldn't load settings");
  }
  const dataCube = getDataCube(sources, dataCubeName);
  if (!dataCube) {
    throw new InvalidRequestError(`Unknown Data Cube: ${dataCube.name}`);
  }

  if (!isQueryable(dataCube)) {
    throw new InvalidRequestError(`Data Cube ${dataCube.name} is not queryable`);
  }

  if (!verifyAccess(req, dataCube)) {
    throw new AccessDeniedError("Access denied");
  }

  return dataCube;
}
