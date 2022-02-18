/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import { SeriesDerivation } from "../series/concrete-series";
import { DimensionSort, SeriesSort, Sort, SortDirection } from "../sort/sort";
import { Split, SplitType } from "./split";

const createSort = (isDimension: boolean, { reference, direction, period }: SortOpts = { direction: SortDirection.ascending, period: SeriesDerivation.CURRENT }): Sort => {
  if (isDimension) return new DimensionSort({ reference, direction });
  return new SeriesSort({ reference, direction, period });
};

interface SortOpts {
  reference?: string;
  period?: SeriesDerivation;
  direction?: SortDirection;
}

interface SplitOpts {
  limit?: number;
  sort?: SortOpts;
}

export function stringSplitCombine(dimension: string, {
  limit = 50,
  sort: {
    direction = SortDirection.ascending,
    period = SeriesDerivation.CURRENT,
    reference = dimension
  } = {}
}: SplitOpts = {}): Split {
  return new Split({
    reference: dimension,
    sort: createSort(dimension === reference, { reference, period, direction }),
    limit
  });
}

export function booleanSplitCombine(dimension: string, {
  limit = 50,
  sort: {
    direction = SortDirection.ascending,
    period = SeriesDerivation.CURRENT,
    reference = dimension
  } = {}
}: SplitOpts = {}): Split {
  return new Split({
    type: SplitType.boolean,
    reference: dimension,
    sort: createSort(dimension === reference, { reference, period, direction }),
    limit
  });
}

export function numberSplitCombine(dimension: string, granularity = 100, {
  limit = 50,
  sort: {
    direction = SortDirection.ascending,
    period = SeriesDerivation.CURRENT,
    reference = dimension
  } = {}
}: SplitOpts = {}): Split {
  return new Split({
    type: SplitType.number,
    reference: dimension,
    bucket: granularity,
    sort: createSort(dimension === reference, { direction, period, reference }),
    limit
  });
}

export function timeSplitCombine(dimension: string, granularity = "PT1H", {
  limit = 50,
  sort: {
    direction = SortDirection.ascending,
    period = SeriesDerivation.CURRENT,
    reference = dimension
  } = {}
}: SplitOpts = {}): Split {
  return new Split({
    type: SplitType.time,
    reference: dimension,
    bucket: Duration.fromJS(granularity),
    sort: createSort(dimension === reference, { direction, period, reference }),
    limit
  });
}
