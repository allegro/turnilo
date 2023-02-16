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

import { Essence } from "../models/essence/essence";
import { Visualization } from "../models/visualization-manifest/visualization-manifest";
import { ViewDefinition2 } from "./version-2/view-definition-2";
import { ViewDefinitionConverter2 } from "./version-2/view-definition-converter-2";
import { ViewDefinitionHashEncoder2 } from "./version-2/view-definition-hash-encoder2";
import { ViewDefinition3 } from "./version-3/view-definition-3";
import { ViewDefinitionConverter3 } from "./version-3/view-definition-converter-3";
import { ViewDefinitionHashEncoder3 } from "./version-3/view-definition-hash-encoder3";
import { ViewDefinition4 } from "./version-4/view-definition-4";
import { ViewDefinitionConverter4 } from "./version-4/view-definition-converter-4";
import { ViewDefinitionConverter } from "./view-definition-converter";
import { ViewDefinitionHashEncoder } from "./view-definition-hash-encoder";

export type ViewDefinition = ViewDefinition2 | ViewDefinition3 | ViewDefinition4;
export type ViewDefinitionVersion = "2" | "3" | "4";

export const DEFAULT_VIEW_DEFINITION_VERSION = "4";
export const LEGACY_VIEW_DEFINITION_VERSION = "2";

export const definitionConverters: { [version in ViewDefinitionVersion]: ViewDefinitionConverter<ViewDefinition, Essence> } = {
  2: new ViewDefinitionConverter2(),
  3: new ViewDefinitionConverter3(),
  4: new ViewDefinitionConverter4()
};
export const definitionUrlEncoders: { [version in ViewDefinitionVersion]: ViewDefinitionHashEncoder<ViewDefinition> } = {
  2: new ViewDefinitionHashEncoder2(),
  3: new ViewDefinitionHashEncoder3(),
  4: new ViewDefinitionHashEncoder3()
};

export const defaultDefinitionConverter = definitionConverters[DEFAULT_VIEW_DEFINITION_VERSION];

export const version2Visualizations = new Set<Visualization>([
  "totals",
  "table",
  "line-chart",
  "bar-chart"
]);
