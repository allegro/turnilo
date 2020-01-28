/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { List, Record } from "immutable";
import { FilterClause } from "../../../common/models/filter-clause/filter-clause";

export interface HighlightValue {
  clauses: List<FilterClause>;
  key: string | null;
}

const defaultHighlight: HighlightValue = {
  clauses: List.of(),
  key: null
};

export class Highlight extends Record<HighlightValue>(defaultHighlight) {

  public toString(): string {
    return `[Highlight ${this.clauses.toString()}]`;
  }
}
