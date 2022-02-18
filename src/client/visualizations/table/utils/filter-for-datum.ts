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
import { List, Set } from "immutable";
import { PseudoDatum } from "plywood";
import { DateRange } from "../../../../common/models/date-range/date-range";
import {
  BooleanFilterClause,
  FilterClause,
  FixedTimeFilterClause,
  NumberFilterClause,
  NumberRange,
  StringFilterAction,
  StringFilterClause
} from "../../../../common/models/filter-clause/filter-clause";
import { SplitType } from "../../../../common/models/split/split";
import { Splits } from "../../../../common/models/splits/splits";

export function getFilterFromDatum(splits: Splits, flatDatum: PseudoDatum): List<FilterClause> {
  const splitNesting = flatDatum["__nest"];
  const { splits: splitCombines } = splits;

  if (splitNesting === 0 || splitNesting > splitCombines.size) return null;

  const filterClauses = splitCombines
    .take(splitNesting)
    .map(({ reference, type }) => {
      const segment: any = flatDatum[reference];

      switch (type) {
        case SplitType.number:
          return new NumberFilterClause({ reference, values: List.of(new NumberRange(segment)) });
        case SplitType.time:
          return new FixedTimeFilterClause({ reference, values: List.of(new DateRange(segment)) });
        case SplitType.string:
          return new StringFilterClause({ reference, action: StringFilterAction.IN, values: Set.of(segment) });
        case SplitType.boolean:
          return new BooleanFilterClause({ reference, values: Set.of(segment) });
      }
    });

  return List(filterClauses);
}
