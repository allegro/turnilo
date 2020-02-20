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

import { Duration } from "chronoshift";
import { List, Set } from "immutable";
import { Booleanish } from "../../../client/components/filter-menu/boolean-filter-menu/boolean-filter-menu";
import { DateRange } from "../date-range/date-range";
import {
  BooleanFilterClause,
  FilterClause,
  FixedTimeFilterClause,
  NumberFilterClause,
  NumberRange,
  RelativeTimeFilterClause,
  StringFilterAction,
  StringFilterClause,
  TimeFilterPeriod
} from "./filter-clause";

export function stringWithAction(reference: string, action: StringFilterAction, values: string[], not = false): FilterClause {
  if (action !== StringFilterAction.IN && values instanceof Array && values.length !== 1) {
    throw new Error(`Unsupported values: ${values} for action: ${action}.`);
  }

  return new StringFilterClause({ reference, action, values: Set(values), not });
}

export function stringIn(reference: string, values: string[], not = false): StringFilterClause {
  return new StringFilterClause({ reference, action: StringFilterAction.IN, values: Set(values), not });
}

export function stringContains(reference: string, value: string, not = false): StringFilterClause {
  return new StringFilterClause({ reference, action: StringFilterAction.CONTAINS, values: Set.of(value), not });
}

export function stringMatch(reference: string, value: string, not = false): StringFilterClause {
  return new StringFilterClause({ reference, action: StringFilterAction.MATCH, values: Set.of(value), not });
}

export function boolean(reference: string, values: Booleanish[], not = false): BooleanFilterClause {
  return new BooleanFilterClause({ reference, not, values: Set(values) });
}

export function numberRange(reference: string, start: number, end: number, bounds = "[)", not = false): NumberFilterClause {
  return new NumberFilterClause({ reference, not, values: List.of(new NumberRange({ bounds, start, end })) });
}

export function timeRange(reference: string, start: Date, end: Date): FixedTimeFilterClause {
  return new FixedTimeFilterClause({ reference, values: List.of(new DateRange({ start, end })) });
}

export function timePeriod(reference: string, duration: string, period: TimeFilterPeriod): RelativeTimeFilterClause {
  return new RelativeTimeFilterClause({ reference, duration: Duration.fromJS(duration), period });
}
