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
import { Essence } from "../../../common/models/essence/essence";
import { isNil } from "../../../common/utils/general/general";
import { definitionConverters, ViewDefinition, ViewDefinitionVersion } from "../../../common/view-definitions";
import { ViewDefinitionConverter } from "../../../common/view-definitions/view-definition-converter";
import { InvalidRequestError } from "../request-errors/request-errors";

export function parseViewDefinitionConverter(req: Request): ViewDefinitionConverter<ViewDefinition, Essence> {
  const { viewDefinitionVersion } = req.body;
  if (isNil(viewDefinitionVersion)) {
    throw new InvalidRequestError("Parameter viewDefinitionVersion is required");
  }
  const converter = definitionConverters[String(viewDefinitionVersion) as ViewDefinitionVersion];

  if (converter == null) {
    throw new InvalidRequestError(`Unsupported viewDefinitionVersion value: ${viewDefinitionVersion}`);
  }

  return converter;
}
