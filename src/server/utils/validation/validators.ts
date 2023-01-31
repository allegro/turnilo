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

import { Timezone } from "chronoshift";
import { Request } from "express";
import { Expression } from "plywood";
import { deserialize } from "../../../client/deserializers/app-settings";
import { AppSettings, ClientAppSettings, serialize } from "../../../common/models/app-settings/app-settings";
import { ClientDataCube } from "../../../common/models/data-cube/data-cube";
import { isQueryable, QueryableDataCube } from "../../../common/models/data-cube/queryable-data-cube";
import { Essence } from "../../../common/models/essence/essence";
import { getDataCube, Sources } from "../../../common/models/sources/sources";
import { definitionConverters, ViewDefinition, ViewDefinitionVersion } from "../../../common/view-definitions";
import { ViewDefinitionConverter } from "../../../common/view-definitions/view-definition-converter";
import { checkAccess } from "../datacube-guard/datacube-guard";
import { SettingsManager } from "../settings-manager/settings-manager";

export class ValidationError extends Error {
  constructor(message: string, public code = 400) {
    super(message);
  }
}

export function isValidationError(e: Error): e is ValidationError {
  return e instanceof ValidationError;
}

function convertToClientAppSettings(appSettings: AppSettings): ClientAppSettings {
  return deserialize(serialize(appSettings));
}

function convertToClientDataCube(cube: QueryableDataCube): ClientDataCube {
  return {
    ...cube,
    timeAttribute: cube.timeAttribute && cube.timeAttribute.name
  };
}

export function createEssence(
  viewDefinition: ViewDefinition,
  converter: ViewDefinitionConverter<ViewDefinition, Essence>,
  dataCube: QueryableDataCube,
  appSettings: AppSettings
): Essence {
  const clientDataCube = convertToClientDataCube(dataCube);
  const clientAppSettings = convertToClientAppSettings(appSettings);

  try {
    return converter.fromViewDefinition(viewDefinition, clientAppSettings, clientDataCube);
  } catch ({ message }) {
    throw new ValidationError(`invalid viewDefinition object: ${message}`);
  }
}

export function parseExpression(req: Request): Expression {
  try {
    return Expression.fromJS(req.body.expression);
  } catch (e) {
    throw new ValidationError(`bad expression: ${e.message}`);
  }
}

export function parseTimezone(req: Request): Timezone {
  const { timezone } = req.body;
  if (typeof timezone !== "string") {
    throw new ValidationError("timezone must be a string");
  }
  try {
    return Timezone.fromJS(timezone);
  } catch (e) {
    throw new ValidationError(`bad timezone: ${e.message}`);
  }
}

export function parseViewDefinitionConverter(req: Request): ViewDefinitionConverter<ViewDefinition, Essence> {
  const { viewDefinitionVersion } = req.body;
  if (typeof viewDefinitionVersion !== "string") {
    throw new ValidationError("must have a viewDefinitionVersion");
  }
  const converter = definitionConverters[viewDefinitionVersion as ViewDefinitionVersion];

  if (converter == null) {
    throw new ValidationError("unsupported viewDefinitionVersion value");
  }

  return converter;
}

export function parseViewDefinition(req: Request): ViewDefinition {
  const { viewDefinition } = req.body;
  if (typeof viewDefinition !== "object") {
    throw new ValidationError("viewDefinition must be an object");
  }

  return viewDefinition;
}

export async function parseDataCube(req: Request, getSources: SettingsManager["getSources"]): Promise<QueryableDataCube> {
  const dataCube = req.body.dataCube || req.body.dataSource; // back compatibility
  if (typeof dataCube !== "string") {
    throw new ValidationError("must have a dataCube");
  }
  let sources: Sources;
  try {
    sources = await getSources();
  } catch (e) {
    throw new ValidationError("Couldn't load settings");
  }
  const myDataCube = getDataCube(sources, dataCube);
  if (!myDataCube) {
    throw new ValidationError("unknown data cube");
  }

  if (!isQueryable(myDataCube)) {
    throw new ValidationError("un queryable data cube");
  }

  if (!(checkAccess(myDataCube, req.headers))) {
    throw new ValidationError("access denied", 403);
  }

  return myDataCube;
}
