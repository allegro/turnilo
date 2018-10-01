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

import { Duration } from "chronoshift";
import { List, Set } from "immutable";
import {
  BooleanFilterClause,
  DateRange,
  FilterClause,
  FixedTimeFilterClause,
  NumberFilterClause, NumberRange,
  RelativeTimeFilterClause,
  StringFilterAction,
  StringFilterClause,
  TimeFilterPeriod
} from "./filter-clause";

export class FilterClauseFixtures {

  static stringWithAction(reference: string, action: StringFilterAction, values: string[], not = false): FilterClause {
    if (action !== StringFilterAction.CONTAINS && values instanceof Array && values.length !== 1) {
      throw new Error(`Unsupported values: ${values} for action: ${action}.`);
    }

    return new StringFilterClause({ reference, action, values: Set(values), not });
  }

  static stringIn(reference: string, values: string[], not = false): FilterClause {
    return new StringFilterClause({ reference, action: StringFilterAction.IN, values: Set(values), not });
  }

  static stringContains(reference: string, value: string, not = false): FilterClause {
    return new StringFilterClause({ reference, action: StringFilterAction.CONTAINS, values: Set.of(value), not });
  }

  static stringMatch(reference: string, value: string, not = false): FilterClause {
    return new StringFilterClause({ reference, action: StringFilterAction.MATCH, values: Set.of(value), not });
  }

  static boolean(reference: string, values: boolean[], not = false): FilterClause {
    return new BooleanFilterClause({ reference, not, values: Set(values) });
  }

  static numberRange(reference: string, start: number, end: number, bounds = "[)", not = false): FilterClause {
    return new NumberFilterClause({ reference, not, values: List.of(new NumberRange({ bounds, start, end })) });
  }

  static timeRange(reference: string, start: Date, end: Date): FilterClause {
    return new FixedTimeFilterClause({ reference, values: List.of(new DateRange({ start, end })) });
  }

  static timePeriod(reference: string, duration: string, period: TimeFilterPeriod): FilterClause {
    return new RelativeTimeFilterClause({ reference, duration: Duration.fromJS(duration), period });
  }
}
