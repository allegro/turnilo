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

import { $, r, RefExpression, TimeRange } from "plywood";
import { FilterClause } from "../../models/filter-clause/filter-clause";

export class FormatterFixtures {

  static fixedTimeFilter(start: Date, end: Date) {
    return new FilterClause({
      expression: r("time"),
      selection: r(TimeRange.fromJS({ start, end }))
    });
  }

  static previousDuration(duration: string) {
    const previousStep = -1;
    return this.flooredDuration($(FilterClause.NOW_REF_NAME), duration, previousStep);
  }

  static flooredDuration(reference: RefExpression, duration: string, step: number) {
    return new FilterClause({
      expression: r("time"),
      selection: reference.timeFloor(duration).timeRange(duration, step)
    });
  }

  static currentDuration(duration: string) {
    const currentStep = 1;
    return this.flooredDuration($(FilterClause.NOW_REF_NAME), duration, currentStep);
  }

  static latestDuration(duration: string, step: number) {
    return this.timeRangeDuration($(FilterClause.MAX_TIME_REF_NAME), duration, step);
  }

  static timeRangeDuration(reference: RefExpression, duration: string, step: number) {
    return new FilterClause({
      expression: r("time"),
      selection: reference.timeRange(duration, step)
    });
  }

  static numberFilter() {
    return FilterClause.fromJS({
      expression: { op: "ref", name: "commentLength" },
      selection: {
        op: "literal",
        value: {
          setType: "NUMBER",
          elements: [1, 2, 3]
        },
        type: "SET"
      },
      exclude: true
    });
  }

  static stringFilterShort() {
    return FilterClause.fromJS({
      expression: { op: "ref", name: "country" },
      selection: {
        op: "literal",
        value: {
          setType: "STRING",
          elements: ["iceland"]
        },
        type: "SET"
      }
    });
  }

}
