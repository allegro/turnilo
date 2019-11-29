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

import { hashToObject, objectToHash } from "../hash-conversions";
import { ViewDefinitionHashEncoder } from "../view-definition-hash-encoder";
import { ViewDefinition3 } from "./view-definition-3";

export class ViewDefinitionHashEncoder3 implements ViewDefinitionHashEncoder<ViewDefinition3> {
  decodeUrlHash(urlHash: string, visualization: string): ViewDefinition3 {
    return hashToObject(urlHash);
  }

  encodeUrlHash(definition: ViewDefinition3): string {
    return objectToHash(definition);
  }
}
