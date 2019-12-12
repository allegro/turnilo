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

import { SeriesDerivation } from "../../models/series/concrete-series";
import { SortDirection, SortType } from "../../models/sort/sort";
import { SplitType } from "../../models/split/split";
import { NumberSplitDefinition, StringSplitDefinition, TimeSplitDefinition } from "./split-definition";

export function stringSplitDefinition(dimension: string, {
  limit = 50,
  sort: {
    direction = SortDirection.ascending,
    period = SeriesDerivation.CURRENT,
    reference = dimension
  } = {}
} = {}): StringSplitDefinition {
  return {
    type: SplitType.string,
    dimension,
    sort: {
      ref: reference,
      direction,
      period,
      type: reference === dimension ? SortType.DIMENSION : SortType.SERIES
    },
    limit
  };
}

export function timeSplitDefinition(dimension: string, granularity: string, {
  limit = 50,
  sort: {
    direction = SortDirection.ascending,
    period = SeriesDerivation.CURRENT,
    reference = dimension
  } = {}
} = {}): TimeSplitDefinition {
  return {
    granularity,
    type: SplitType.time,
    dimension,
    sort: {
      ref: reference,
      direction,
      period,
      type: reference === dimension ? SortType.DIMENSION : SortType.SERIES
    },
    limit
  };
}

export function numberSplitDefinition(dimension: string, granularity: number, {
  limit = 50,
  sort: {
    direction = SortDirection.ascending,
    period = SeriesDerivation.CURRENT,
    reference = dimension
  } = {}
} = {}): NumberSplitDefinition {
  return {
    granularity,
    type: SplitType.number,
    dimension,
    sort: {
      ref: reference,
      direction,
      period,
      type: reference === dimension ? SortType.DIMENSION : SortType.SERIES
    },
    limit
  };
}
