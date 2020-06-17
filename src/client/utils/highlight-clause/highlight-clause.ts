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

import { List } from "immutable";
import { NumberRange as PlywoodNumberRange, Range, TimeRange } from "plywood";
import { DateRange } from "../../../common/models/date-range/date-range";
import { FilterClause, FixedTimeFilterClause, NumberFilterClause, NumberRange } from "../../../common/models/filter-clause/filter-clause";
import { ContinuousRange } from "../../visualizations/line-chart/utils/continuous-types";
import { isValidClause } from "../../visualizations/line-chart/utils/is-valid-clause";

export function toFilterClause(range: ContinuousRange, reference: string): FilterClause {
  if (TimeRange.isTimeRange(range)) {
    const dateRange = new DateRange(range);
    const values = List.of(dateRange);
    return new FixedTimeFilterClause({ reference, values });
  }
  if (PlywoodNumberRange.isNumberRange(range)) {
    const numberRange = new NumberRange(range);
    const values = List.of(numberRange);
    return new NumberFilterClause({ reference, values });
  }
  throw new Error(`Expected Number or Time range, got: ${range}`);
}

export function toPlywoodRange(clause: FilterClause): ContinuousRange {
  if (!isValidClause(clause)) {
    throw new Error(`Expected Number or FixedTime Filter Clause. Got ${clause}`);
  }
  const value = clause.values.first();
  return Range.fromJS(value) as ContinuousRange;
}
