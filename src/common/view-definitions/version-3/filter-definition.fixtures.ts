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

import { $, r } from "plywood";
import { FilterClause, SupportedAction } from "../../models/filter-clause/filter-clause";
import { FilterType, StringFilterAction, StringFilterClauseDefinition, TimeFilterClauseDefinition } from "./filter-definition";

export class FilterDefinitionFixtures {
  static stringFilterClauseDefinition(ref: string, action: StringFilterAction, exclude: boolean, values: string[]): StringFilterClauseDefinition {
    return {
      ref,
      type: FilterType.string,
      action,
      exclude,
      values
    };
  }

  static stringFilterClause(dimension: string, action: StringFilterAction, exclude: boolean, values: string[]) {
    switch (action) {
      case StringFilterAction.in:
        return this.stringInFilterClause(dimension, exclude, values);
      case StringFilterAction.contains:
        return this.stringContainsFilterClause(dimension, exclude, values[0]);
      case StringFilterAction.match:
        return this.stringMatchFilterClause(dimension, exclude, values[0]);
    }
  }

  static stringInFilterClause(dimension: string, exclude: boolean, values: string[]) {
    return new FilterClause({
      action: SupportedAction.overlap,
      exclude,
      selection: r(values),
      expression: $(dimension)
    });
  }

  static stringContainsFilterClause(dimension: string, exclude: boolean, value: string) {
    return new FilterClause({
      action: SupportedAction.contains,
      exclude,
      selection: r(value),
      expression: $(dimension)
    });
  }

  static stringMatchFilterClause(dimension: string, exclude: boolean, value: string) {
    return new FilterClause({
      action: SupportedAction.match,
      exclude,
      selection: value,
      expression: $(dimension)
    });
  }
}
