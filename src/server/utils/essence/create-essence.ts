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

import { deserialize } from "../../../client/deserializers/app-settings";
import { AppSettings, ClientAppSettings, serialize } from "../../../common/models/app-settings/app-settings";
import { ClientDataCube } from "../../../common/models/data-cube/data-cube";
import { QueryableDataCube } from "../../../common/models/data-cube/queryable-data-cube";
import { Essence } from "../../../common/models/essence/essence";
import { ViewDefinition } from "../../../common/view-definitions";
import { ViewDefinitionConverter } from "../../../common/view-definitions/view-definition-converter";
import { InvalidRequestError } from "../request-errors/request-errors";

function convertToClientAppSettings(appSettings: AppSettings): ClientAppSettings {
  return deserialize(serialize(appSettings));
}

function convertToClientDataCube(cube: QueryableDataCube): ClientDataCube {
  return {
    ...cube,
    timeAttribute: cube.timeAttribute && cube.timeAttribute.name
  };
}

/*
 NOTE: This function exists because we need to reconstruct Essence object on the server.
 Current code assumes that Essence is created on client.
 If we will split to client and server variants of Essence, this function will become more obvious.
*/
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
    throw new InvalidRequestError(`invalid viewDefinition object: ${message}`);
  }
}
