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

import { SortDirection, SortType } from "../../models/sort/sort";
import { SplitType } from "../../models/split/split";
import { StringSplitDefinition } from "./split-definition";

export class SplitDefinitionFixtures {
  static stringSplitDefinition(dimension: string, sortOn: string, sortDirection = SortDirection.descending, limit = 5): StringSplitDefinition {
    return {
      type: SplitType.string,
      dimension,
      sort: {
        ref: sortOn,
        direction: sortDirection,
        type: sortOn === dimension ? SortType.DIMENSION : SortType.SERIES
      },
      limit
    };
  }
}
