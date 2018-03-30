/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import { $, LimitExpression, NumberBucketExpression, SortExpression, TimeBucketExpression } from "plywood";
import { SortDirection, sortDirectionMapper } from "../../view-definitions/version-3/split-definition";
import { SplitCombine } from "./split-combine";

export class SplitCombineFixtures {

  static stringSplitCombine(dimension: string, sortOn: string, sortDirection: SortDirection, limit: number): SplitCombine {
    return new SplitCombine({
      expression: $(dimension),
      bucketAction: null,
      sortAction: new SortExpression({ expression: $(sortOn), direction: sortDirectionMapper[sortDirection] }),
      limitAction: new LimitExpression({ value: limit })
    });
  }

  static numberSplitCombine(dimension: string, granularity: number, sortOn: string, sortDirection: SortDirection, limit: number): SplitCombine {
    return new SplitCombine({
      expression: $(dimension),
      bucketAction: new NumberBucketExpression({ size: granularity, offset: 0 }),
      sortAction: new SortExpression({ expression: $(sortOn), direction: sortDirectionMapper[sortDirection] }),
      limitAction: new LimitExpression({ value: limit })
    });
  }

  static timeSplitCombine(dimension: string, granularity: string, sortOn: string, sortDirection: SortDirection, limit: number): SplitCombine {
    return new SplitCombine({
      expression: $(dimension),
      bucketAction: new TimeBucketExpression({ duration: Duration.fromJS(granularity) }),
      sortAction: new SortExpression({ expression: $(sortOn), direction: sortDirectionMapper[sortDirection] }),
      limitAction: limit && new LimitExpression({ value: limit })
    });
  }
}
