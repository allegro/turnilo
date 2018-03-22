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

import { $, LimitExpression, SortExpression } from "plywood";
import { SplitCombine } from "../../models/split-combine/split-combine";
import { SortDirection, sortDirectionMapper, SplitType, StringSplitDefinition } from "./split-definition";

export class SplitDefinitionFixtures {
  static stringSplitModel(dimension: string, sortOn: string, sortDirection: SortDirection, limit: number): StringSplitDefinition {
    return {
      type: SplitType.string,
      dimension,
      sort: { ref: sortOn, direction: sortDirection },
      limit: limit
    };
  }

  static stringSplitCombine(dimension: string, sortOn: string, sortDirection: SortDirection, limit: number): SplitCombine {
    return new SplitCombine({
      expression: $(dimension),
      bucketAction: null,
      sortAction: new SortExpression({ expression: $(sortOn), direction: sortDirectionMapper[sortDirection] }),
      limitAction: new LimitExpression({ value: limit })
    });
  }
}
