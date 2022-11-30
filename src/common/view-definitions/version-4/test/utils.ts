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

import { clientAppSettings } from "../../../models/app-settings/app-settings.fixtures";
import { Essence } from "../../../models/essence/essence";
import { assertEqlEssence } from "../../test/assertions";
import { dataCube } from "../../test/data-cube.fixture";
import { ViewDefinition4 } from "../view-definition-4";
import { ViewDefinitionConverter4 } from "../view-definition-converter-4";

const converter = new ViewDefinitionConverter4();
export const toEssence = (viewDef: ViewDefinition4) => converter.fromViewDefinition(viewDef, clientAppSettings, dataCube);

export function assertConversionToEssence(viewDef: ViewDefinition4, essence: Essence) {
  assertEqlEssence(toEssence(viewDef), essence);
}
