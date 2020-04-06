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

import { arrayToHash, hashToArray } from "../hash-conversions";
import { ViewDefinitionHashEncoder } from "../view-definition-hash-encoder";
import { ViewDefinition2 } from "./view-definition-2";

export class ViewDefinitionHashEncoder2 implements ViewDefinitionHashEncoder<ViewDefinition2> {
  decodeUrlHash(urlHash: string, visualization: string): ViewDefinition2 {
    const jsArray = hashToArray(urlHash);

    if (!(8 <= jsArray.length && jsArray.length <= 11)) return null;

    return {
      visualization,
      timezone: jsArray[0],
      filter: jsArray[1],
      splits: jsArray[2],
      multiMeasureMode: jsArray[3],
      singleMeasure: jsArray[4],
      selectedMeasures: jsArray[5],
      pinnedDimensions: jsArray[6],
      pinnedSort: jsArray[7],
      compare: jsArray[9] || null,
      highlight: jsArray[10] || null
    };
  }

  encodeUrlHash(definition: ViewDefinition2): string {
    const compressed: any[] = [
      definition.timezone,         // 0
      definition.filter,           // 1
      definition.splits,           // 2
      definition.multiMeasureMode, // 3
      definition.singleMeasure,    // 4
      definition.selectedMeasures, // 5
      definition.pinnedDimensions, // 6
      definition.pinnedSort,       // 7
      /*
       There were stored colors. We don't support them anymore so we write null here.
       We can't omit it here because that would force us to change decodeUrlHash and that
       would make it incompatible with old urls.
      */
      null,                        // 8
      definition.compare,          // 9
      definition.highlight         // 10
    ];

    return arrayToHash(compressed);
  }
}
