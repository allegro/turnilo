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

import { Duration } from "chronoshift";
import { Direction } from "plywood";
import { Sort } from "../../models/sort/sort";
import { Split, SplitType } from "../../models/split/split";

export enum SortDirection {
  ascending = "ascending",
  descending = "descending"
}

export interface BaseSplitDefinition {
  type: SplitType;
  dimension: string;
  sort: { ref: string, direction: SortDirection };
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

export const sortDirectionMapper: { [sort in SortDirection]: Direction; } = {
  ascending: "ascending",
  descending: "descending"
};

interface SplitDefinitionConversion<In extends SplitDefinition> {
  toSplitCombine(split: In): Split;

  fromSplitCombine(splitCombine: Split): In;
}

const numberSplitConversion: SplitDefinitionConversion<NumberSplitDefinition> = {
  toSplitCombine(split: NumberSplitDefinition): Split {
    const { dimension, limit, sort, granularity } = split;
    return new Split({
      type: SplitType.number,
      reference: dimension,
      bucket: granularity,
      sort: sort && new Sort({ reference: sort.ref, direction: sort.direction }),
      limit
    });
  },

  fromSplitCombine({ bucket, sort, reference, limit }: Split): NumberSplitDefinition {
    if (typeof bucket === "number") {
      return {
        type: SplitType.number,
        dimension: reference,
        granularity: bucket,
        sort: sort && { ref: sort.reference, direction: sort.direction },
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
      sort: sort && new Sort({ reference: sort.ref, direction: sort.direction }),
      limit
    });
  },

  fromSplitCombine({ limit, sort, reference, bucket }: Split): TimeSplitDefinition {
    if (bucket instanceof Duration) {
      return {
        type: SplitType.time,
        dimension: reference,
        granularity: bucket.toJS(),
        sort: sort && { ref: sort.reference, direction: sort.direction },
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
      sort: sort && new Sort({ reference: sort.ref, direction: sort.direction }),
      limit
    });
  },

  fromSplitCombine({ limit, sort, reference }: Split): StringSplitDefinition {
    return {
      type: SplitType.string,
      dimension: reference,
      sort: sort && { ref: sort.reference, direction: sort.direction },
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
