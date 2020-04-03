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
import { AVAILABLE_LIMITS } from "../../limit/limit";
import { SeriesDerivation } from "../../models/series/concrete-series";
import { DimensionSort, SeriesSort, Sort, SortDirection, SortType } from "../../models/sort/sort";
import { Split, SplitType } from "../../models/split/split";
import { isFiniteNumber, isNumber } from "../../utils/general/general";

export interface SplitSortDefinition {
  ref: string;
  direction: SortDirection;
  type: SortType;
  period?: SeriesDerivation;
}

export interface BaseSplitDefinition {
  type: SplitType;
  dimension: string;
  sort: SplitSortDefinition;
  limit?: number;
}

export interface NumberSplitDefinition extends BaseSplitDefinition {
  type: SplitType.number;
  granularity: number;
}

export interface StringSplitDefinition extends BaseSplitDefinition {
  type: SplitType.string;
}

export interface TimeSplitDefinition extends BaseSplitDefinition {
  type: SplitType.time;
  granularity: string;
}

export type SplitDefinition = NumberSplitDefinition | StringSplitDefinition | TimeSplitDefinition;

interface SplitDefinitionConversion<In extends SplitDefinition> {
  toSplitCombine(split: In): Split;

  fromSplitCombine(splitCombine: Split): In;
}

const PREVIOUS_PREFIX = "_previous__";
const DELTA_PREFIX = "_delta__";

function inferType(type: string, reference: string, dimensionName: string) {
  switch (type) {
    case SortType.DIMENSION:
      return SortType.DIMENSION;
    case SortType.SERIES:
      return SortType.SERIES;
    default:
      return reference === dimensionName ? SortType.DIMENSION : SortType.SERIES;
  }
}

function inferPeriodAndReference({ ref, period }: { ref: string, period?: SeriesDerivation }): { reference: string, period: SeriesDerivation } {
  if (period) return { period, reference: ref };
  if (ref.indexOf(PREVIOUS_PREFIX) === 0) return { reference: ref.substring(PREVIOUS_PREFIX.length), period: SeriesDerivation.PREVIOUS };
  if (ref.indexOf(DELTA_PREFIX) === 0) return { reference: ref.substring(DELTA_PREFIX.length), period: SeriesDerivation.DELTA };
  return { reference: ref, period: SeriesDerivation.CURRENT };
}

function toSort(sort: any, dimensionName: string): Sort {
  const { direction } = sort;
  const { reference, period } = inferPeriodAndReference(sort);
  const type = inferType(sort.type, reference, dimensionName);
  switch (type) {
    case SortType.DIMENSION:
      return new DimensionSort({ reference, direction });
    case SortType.SERIES:
      return new SeriesSort({ reference, direction, period });
  }
}

function fromSort(sort: Sort): SplitSortDefinition {
  const { reference: ref, ...rest } = sort.toJS();
  return { ref, ...rest };
}

function toLimit(limit: unknown): number | null {
  if (limit === null) return null;
  if (isNumber(limit) && isFiniteNumber(limit)) return limit;
  return AVAILABLE_LIMITS[0];
}

const numberSplitConversion: SplitDefinitionConversion<NumberSplitDefinition> = {
  toSplitCombine(split: NumberSplitDefinition): Split {
    const { dimension, limit, sort, granularity } = split;
    return new Split({
      type: SplitType.number,
      reference: dimension,
      bucket: granularity,
      sort: sort && toSort(sort, dimension),
      limit: toLimit(limit)
    });
  },

  fromSplitCombine({ bucket, sort, reference, limit }: Split): NumberSplitDefinition {
    if (typeof bucket === "number") {
      return {
        type: SplitType.number,
        dimension: reference,
        granularity: bucket,
        sort: sort && fromSort(sort),
        limit
      };
    } else {
      throw new Error("");
    }
  }
};

const timeSplitConversion: SplitDefinitionConversion<TimeSplitDefinition> = {
  toSplitCombine(split: TimeSplitDefinition): Split {
    const { dimension, limit, sort, granularity } = split;
    return new Split({
      type: SplitType.time,
      reference: dimension,
      bucket: Duration.fromJS(granularity),
      sort: sort && toSort(sort, dimension),
      limit: toLimit(limit)
    });
  },

  fromSplitCombine({ limit, sort, reference, bucket }: Split): TimeSplitDefinition {
    if (bucket instanceof Duration) {
      return {
        type: SplitType.time,
        dimension: reference,
        granularity: bucket.toJS(),
        sort: sort && fromSort(sort),
        limit
      };
    } else {
      throw new Error("");
    }
  }

};

const stringSplitConversion: SplitDefinitionConversion<StringSplitDefinition> = {
  toSplitCombine(split: StringSplitDefinition): Split {
    const { dimension, limit, sort } = split;
    return new Split({
      reference: dimension,
      sort: sort && toSort(sort, dimension),
      limit: toLimit(limit)
    });
  },

  fromSplitCombine({ limit, sort, reference }: Split): StringSplitDefinition {
    return {
      type: SplitType.string,
      dimension: reference,
      sort: sort && fromSort(sort),
      limit
    };
  }
};

const splitConversions: { [type in SplitType]: SplitDefinitionConversion<SplitDefinition> } = {
  number: numberSplitConversion,
  string: stringSplitConversion,
  time: timeSplitConversion
};

export interface SplitDefinitionConverter {
  toSplitCombine(split: SplitDefinition): Split;

  fromSplitCombine(splitCombine: Split): SplitDefinition;
}

export const splitConverter: SplitDefinitionConverter = {
  toSplitCombine(split: SplitDefinition): Split {
    return splitConversions[split.type].toSplitCombine(split);
  },

  fromSplitCombine(splitCombine: Split): SplitDefinition {
    const { bucket } = splitCombine;

    if (bucket instanceof Duration) {
      return timeSplitConversion.fromSplitCombine(splitCombine);
    } else if (typeof bucket === "number") {
      return numberSplitConversion.fromSplitCombine(splitCombine);
    } else {
      return stringSplitConversion.fromSplitCombine(splitCombine);
    }
  }
};
