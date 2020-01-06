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
import { DateRange } from "../../models/date-range/date-range";
import {
  FixedTimeFilterClause,
  NumberFilterClause,
  NumberRange,
  RelativeTimeFilterClause,
  StringFilterAction,
  StringFilterClause,
  TimeFilterPeriod
} from "../../models/filter-clause/filter-clause";

export class FormatterFixtures {

  static fixedTimeFilter(start: Date, end: Date) {
    return new FixedTimeFilterClause({
      reference: "time",
      values: List.of(new DateRange({ start, end }))
    });
  }

  static previousDuration(duration: string) {
    return new RelativeTimeFilterClause({
      reference: "time",
      period: TimeFilterPeriod.PREVIOUS,
      duration: Duration.fromJS(duration)
    });
  }

  static currentDuration(duration: string) {
    return new RelativeTimeFilterClause({
      reference: "time",
      period: TimeFilterPeriod.CURRENT,
      duration: Duration.fromJS(duration)
    });
  }

  static latestDuration(duration: string) {
    return new RelativeTimeFilterClause({
      reference: "time",
      period: TimeFilterPeriod.LATEST,
      duration: Duration.fromJS(duration)
    });
  }

  static numberFilter() {
    return new NumberFilterClause({
      reference: "commentLength",
      not: true,
      values: List.of(new NumberRange({ start: 1, end: 3 }))
    });
  }

  static stringFilterShort() {
    return new StringFilterClause({
      action: StringFilterAction.IN,
      reference: "country",
      values: Set.of("iceland")
    });
  }
}
