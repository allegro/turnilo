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

import { Booleanish } from "../../../client/components/filter-menu/boolean-filter-menu/boolean-filter-menu";
import { StringFilterAction } from "../../models/filter-clause/filter-clause";
import {
  BooleanFilterClauseDefinition,
  FilterType,
  NumberFilterClauseDefinition,
  StringFilterClauseDefinition,
  TimeFilterClauseDefinition
} from "./filter-definition";

export function booleanFilterDefinition(ref: string, values: Booleanish[], not = false): BooleanFilterClauseDefinition {
  return {
    ref,
    type: FilterType.boolean,
    not,
    values
  };
}

export function stringFilterDefinition(ref: string, action: StringFilterAction, values: string[], not = false, ignoreCase = false): StringFilterClauseDefinition {
  return {
    ref,
    type: FilterType.string,
    action,
    not,
    values,
    ignoreCase
  };
}

export function numberRangeFilterDefinition(ref: string, start: number, end: number, bounds: string | null = "[)", not = false): NumberFilterClauseDefinition {
  return {
    ref,
    type: FilterType.number,
    not,
    ranges: [{ start, end, bounds }]
  };
}

export function timeRangeFilterDefinition(ref: string, start: string, end: string): TimeFilterClauseDefinition {
  return {
    ref,
    type: FilterType.time,
    timeRanges: [{ start, end }]
  };
}

export function latestTimeFilterDefinition(ref: string, multiple: number, duration: string): TimeFilterClauseDefinition {
  return {
    ref,
    type: FilterType.time,
    timePeriods: [{ type: "latest", duration, step: multiple }]
  };
}

export function flooredTimeFilterDefinition(ref: string, step: number, duration: string): TimeFilterClauseDefinition {
  return {
    ref,
    type: FilterType.time,
    timePeriods: [{ type: "floored", duration, step }]
  };
}

export function currentTimeFilterDefinition(ref: string, duration: string): TimeFilterClauseDefinition {
  return flooredTimeFilterDefinition(ref, 1, duration);
}

export function previousTimeFilterDefinition(ref: string, duration: string): TimeFilterClauseDefinition {
  return flooredTimeFilterDefinition(ref, -1, duration);
}
