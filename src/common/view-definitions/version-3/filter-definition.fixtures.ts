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

import {
  BooleanFilterClauseDefinition,
  FilterType,
  NumberFilterClauseDefinition,
  StringFilterAction,
  StringFilterClauseDefinition,
  TimeFilterClauseDefinition
} from "./filter-definition";

export class FilterDefinitionFixtures {
  static booleanFilterDefinition(ref: string, values: boolean[], exclude = false): BooleanFilterClauseDefinition {
    return {
      ref,
      type: FilterType.boolean,
      exclude,
      values
    };
  }

  static stringFilterDefinition(ref: string, action: StringFilterAction, values: string[], exclude = false): StringFilterClauseDefinition {
    return {
      ref,
      type: FilterType.string,
      action,
      exclude,
      values
    };
  }

  static numberRangeFilterDefinition(ref: string, start: number, end: number, bounds: string | null = "[)", exclude = false): NumberFilterClauseDefinition {
    return {
      ref,
      type: FilterType.number,
      exclude,
      ranges: [{ start, end, bounds }]
    };
  }

  static timeRangeFilterDefinition(ref: string, start: string, end: string): TimeFilterClauseDefinition {
    return {
      ref,
      type: FilterType.time,
      timeRanges: [{ start, end }]
    };
  }

  static latestTimeFilterDefinition(ref: string, multiple: number, duration: string): TimeFilterClauseDefinition {
    return {
      ref,
      type: FilterType.time,
      timePeriods: [{ type: "latest", duration, step: multiple }]
    };
  }

  static flooredTimeFilterDefinition(ref: string, step: number, duration: string): TimeFilterClauseDefinition {
    return {
      ref,
      type: FilterType.time,
      timePeriods: [{ type: "floored", duration, step }]
    };
  }
}
