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
import { Sort, SortDirection, SortReferenceType } from "../sort/sort";
import { Split, SplitType } from "./split";

export class SplitFixtures {

  static stringSplitCombine(dimension: string, sortOn: string, direction: SortDirection, limit: number): Split {
    return new Split({
      reference: dimension,
      sort: new Sort({
        reference: sortOn,
        direction,
        type: dimension === sortOn ? SortReferenceType.DIMENSION : SortReferenceType.MEASURE
      }),
      limit
    });
  }

  static numberSplitCombine(dimension: string, granularity: number, sortOn: string, direction: SortDirection, limit: number): Split {
    return new Split({
      type: SplitType.number,
      reference: dimension,
      bucket: granularity,
      sort: new Sort({
        reference: sortOn,
        direction,
        type: dimension === sortOn ? SortReferenceType.DIMENSION : SortReferenceType.MEASURE
      }),
      limit
    });
  }

  static timeSplitCombine(dimension: string, granularity: string, sortOn: string, direction: SortDirection, limit: number): Split {
    return new Split({
      type: SplitType.time,
      reference: dimension,
      bucket: Duration.fromJS(granularity),
      sort: new Sort({
        reference: sortOn,
        direction,
        type: dimension === sortOn ? SortReferenceType.DIMENSION : SortReferenceType.MEASURE
      }),
      limit
    });
  }
}
