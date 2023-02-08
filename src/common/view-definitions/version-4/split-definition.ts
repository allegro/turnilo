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
import { DataCube } from "../../models/data-cube/data-cube";
import { Dimension } from "../../models/dimension/dimension";
import { findDimensionByName } from "../../models/dimension/dimensions";
import { SeriesDerivation } from "../../models/series/concrete-series";
import { DimensionSort, SeriesSort, Sort, SortDirection, SortType } from "../../models/sort/sort";
import { kindToType, Split, SplitType } from "../../models/split/split";
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

export interface BooleanSplitDefinition extends BaseSplitDefinition {
  type: SplitType.boolean;
}

export type SplitDefinition = BooleanSplitDefinition | NumberSplitDefinition | StringSplitDefinition | TimeSplitDefinition;

interface SplitDefinitionConversion<In extends SplitDefinition> {
  toSplitCombine(split: In, dimension: Dimension): Split;

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

function firstLimitValue(dimension: Dimension): number {
  return dimension.limits[0];
}

function toLimit(limit: unknown, dimension: Dimension): number | null {
  if (limit === null) return null;
  if (isNumber(limit) && isFiniteNumber(limit)) return limit;
  return firstLimitValue(dimension);
}

const numberSplitConversion: SplitDefinitionConversion<NumberSplitDefinition> = {
  toSplitCombine(split: NumberSplitDefinition, dimension: Dimension): Split {
    const { limit, sort, granularity } = split;
    return new Split({
      type: SplitType.number,
      reference: dimension.name,
      bucket: granularity,
      sort: sort && toSort(sort, dimension.name),
      limit: toLimit(limit, dimension)
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
  toSplitCombine(split: TimeSplitDefinition, dimension: Dimension): Split {
    const { limit, sort, granularity } = split;
    return new Split({
      type: SplitType.time,
      reference: dimension.name,
      bucket: Duration.fromJS(granularity),
      sort: sort && toSort(sort, dimension.name),
      limit: toLimit(limit, dimension)
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
  toSplitCombine(split: StringSplitDefinition, dimension: Dimension): Split {
    const { limit, sort } = split;
    return new Split({
      reference: dimension.name,
      sort: sort && toSort(sort, dimension.name),
      limit: toLimit(limit, dimension)
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

const booleanSplitConversion: SplitDefinitionConversion<BooleanSplitDefinition> = {
  fromSplitCombine({ limit, sort, reference }: Split): BooleanSplitDefinition {
    return {
      type: SplitType.boolean,
      dimension: reference,
      sort: sort && fromSort(sort),
      limit
    };
  },

  toSplitCombine(split: BooleanSplitDefinition, dimension: Dimension): Split {
    const { limit, sort } = split;
    return new Split({
      type: SplitType.boolean,
      reference: dimension.name,
      sort: sort && toSort(sort, dimension.name),
      limit: toLimit(limit, dimension)
    });
  }
};

const splitConversions: { [type in SplitType]: SplitDefinitionConversion<SplitDefinition> } = {
  boolean: booleanSplitConversion,
  number: numberSplitConversion,
  string: stringSplitConversion,
  time: timeSplitConversion
};

export interface SplitDefinitionConverter {
  toSplitCombine(split: SplitDefinition, dataCube: Pick<DataCube, "dimensions" | "name">): Split;

  fromSplitCombine(splitCombine: Split): SplitDefinition;
}

export const splitConverter: SplitDefinitionConverter = {
  toSplitCombine(split: SplitDefinition, dataCube: Pick<DataCube, "dimensions" | "name">): Split {
    const dimension = findDimensionByName(dataCube.dimensions, split.dimension);
    if (dimension == null) {
      throw new Error(`Dimension ${split.dimension} not found in data cube ${dataCube.name}.`);
    }
    return splitConversions[kindToType(dimension.kind)].toSplitCombine(split, dimension);
  },

  fromSplitCombine(splitCombine: Split): SplitDefinition {
    switch (splitCombine.type) {
      case SplitType.boolean:
        return booleanSplitConversion.fromSplitCombine(splitCombine);
      case SplitType.number:
        return numberSplitConversion.fromSplitCombine(splitCombine);
      case SplitType.string:
        return stringSplitConversion.fromSplitCombine(splitCombine);
      case SplitType.time:
        return timeSplitConversion.fromSplitCombine(splitCombine);
    }
  }
};
