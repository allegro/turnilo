/*
 * Copyright 2017-2018 Allegro.pl
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

import { Essence } from "../models";
import { ViewDefinitionConverter2 } from "./version-2/view-definition-converter-2";
import { ViewDefinitionHashEncoder2 } from "./version-2/view-definition-hash-encoder2";
import { ViewDefinitionConverter3 } from "./version-3/view-definition-converter-3";
import { ViewDefinitionHashEncoder3 } from "./version-3/view-definition-hash-encoder3";
import { ViewDefinitionConverter } from "./view-definition-converter";
import { ViewDefinitionHashEncoder } from "./view-definition-hash-encoder";

export * from "./version-3/view-definition-3";

export type ViewDefinitionVersion = "2" | "3";

export const DEFAULT_VIEW_DEFINITION_VERSION = "3";

export const definitionConverters: { [version in ViewDefinitionVersion]: ViewDefinitionConverter<object, Essence> } = {
  "2": new ViewDefinitionConverter2(),
  "3": new ViewDefinitionConverter3()
};
export const definitionUrlEncoders: { [version in ViewDefinitionVersion]: ViewDefinitionHashEncoder<object> } = {
  "2": new ViewDefinitionHashEncoder2(),
  "3": new ViewDefinitionHashEncoder3()
};

export const defaultDefinitionConverter = definitionConverters[DEFAULT_VIEW_DEFINITION_VERSION];
export const defaultDefinitionUrlEncoder = definitionUrlEncoders[DEFAULT_VIEW_DEFINITION_VERSION];
