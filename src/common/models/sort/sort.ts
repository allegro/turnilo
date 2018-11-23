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

import { Record } from "immutable";
import { SortDirection } from "../../view-definitions/version-4/split-definition";

export const SORT_ON_DIMENSION_PLACEHOLDER = "__SWIV_SORT_ON_DIMENSIONS__";

interface SortDefinition {
  reference: string;
  direction: SortDirection;
}

const defaultSort: SortDefinition = { reference: null, direction: null };

export class Sort extends Record<SortDefinition>(defaultSort) {

  empty(): boolean {
    return this.reference === defaultSort.reference && this.direction === defaultSort.direction;
  }

}
