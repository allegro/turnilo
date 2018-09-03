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
import { FilterClause, PlywoodFilterMethod } from "./filter-clause";

export class FilterClauseFixtures {

  static stringWithAction(ref: string, action: PlywoodFilterMethod, values: string | string[], exclude = false): FilterClause {
    if (action !== PlywoodFilterMethod.OVERLAP && values instanceof Array && values.length !== 1) {
      throw new Error(`Unsupported values: ${values} for action: ${action}.`);
    }

    switch (action) {
      case PlywoodFilterMethod.OVERLAP:
      case undefined:
        return this.stringIn(ref, typeof values === "string" ? [values] : values, exclude);
      case PlywoodFilterMethod.CONTAINS:
        return this.stringContains(ref, typeof values === "string" ? values : values[0], exclude);
      case PlywoodFilterMethod.MATCH:
        return this.stringMatch(ref, typeof values === "string" ? values : values[0], exclude);
    }
  }

  static stringIn(ref: string, values: string[], exclude = false): FilterClause {
    return new FilterClause({
      action: PlywoodFilterMethod.OVERLAP,
      exclude,
      selection: r(values),
      expression: $(ref)
    });
  }

  static stringContains(dimension: string, value: string, exclude = false): FilterClause {
    return new FilterClause({
      action: PlywoodFilterMethod.CONTAINS,
      exclude,
      selection: r(value),
      expression: $(dimension)
    });
  }

  static stringMatch(dimension: string, value: string, exclude = false): FilterClause {
    return new FilterClause({
      action: PlywoodFilterMethod.MATCH,
      exclude,
      selection: value,
      expression: $(dimension)
    });
  }

  static booleanIn(ref: string, values: boolean[], exclude = false): FilterClause {
    return new FilterClause({
      action: PlywoodFilterMethod.OVERLAP,
      exclude,
      selection: r(values),
      expression: $(ref)
    });
  }

  static numberRange(dimension: string, start: number, end: number, bounds = "[)", exclude = false): FilterClause {
    return new FilterClause({
      action: PlywoodFilterMethod.OVERLAP,
      exclude,
      selection: r([{ start, end, bounds, type: "NUMBER_RANGE" }]),
      expression: $(dimension)
    });
  }

  static timeRange(dimension: string, start: Date, end: Date, exclude = false): FilterClause {
    return new FilterClause({
      action: PlywoodFilterMethod.OVERLAP,
      exclude,
      selection: r({ start, end, type: "TIME_RANGE" }),
      expression: $(dimension)
    });
  }

  static timeDurationLatest(dimension: string, step: number, duration: string): FilterClause {
    return new FilterClause({
      action: PlywoodFilterMethod.OVERLAP,
      selection: $(FilterClause.MAX_TIME_REF_NAME).timeRange(duration, step),
      expression: $(dimension)
    });
  }

  static timeDurationFloored(dimension: string, step: number, duration: string, exclude = false): FilterClause {
    return new FilterClause({
      action: PlywoodFilterMethod.OVERLAP,
      exclude,
      selection: $(FilterClause.NOW_REF_NAME).timeFloor(duration).timeRange(duration, step),
      expression: $(dimension)
    });
  }
}
