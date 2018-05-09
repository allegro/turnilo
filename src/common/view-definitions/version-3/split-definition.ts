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
import { $, Direction, LimitExpression, NumberBucketExpression, RefExpression, SortExpression, TimeBucketExpression } from "plywood";
import { SplitCombine } from "../../models/split-combine/split-combine";

export enum SplitType {
  number = "number",
  string = "string",
  time = "time"
}

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

export const directionMapper: { [sort in Direction]: SortDirection; } = {
  ascending: SortDirection.ascending,
  descending: SortDirection.descending
};

interface SplitDefinitionConversion<In extends SplitDefinition> {
  toSplitCombine(split: In): SplitCombine;

  fromSplitCombine(splitCombine: SplitCombine): In;
}

const numberSplitConversion: SplitDefinitionConversion<NumberSplitDefinition> = {
  toSplitCombine(split: NumberSplitDefinition): SplitCombine {
    const { dimension, limit, sort, granularity } = split;

    const expression = $(dimension);
    const bucketAction = new NumberBucketExpression({ size: granularity });
    const sortAction = sort && new SortExpression({ expression: $(sort.ref), direction: sortDirectionMapper[sort.direction] });
    const limitAction = limit && new LimitExpression({ value: limit });

    return new SplitCombine({ expression, bucketAction, sortAction, limitAction });
  },

  fromSplitCombine(splitCombine: SplitCombine): NumberSplitDefinition {
    const { expression, bucketAction, sortAction, limitAction } = splitCombine;

    if (bucketAction instanceof NumberBucketExpression) {
      const { name: dimension } = expression as RefExpression;

      return {
        type: SplitType.number,
        dimension,
        granularity: bucketAction.size,
        sort: sortAction && { ref: sortAction.refName(), direction: directionMapper[sortAction.direction] },
        limit: limitAction && limitAction.value
      };
    } else {
      throw new Error("");
    }
  }
};

const timeSplitConversion: SplitDefinitionConversion<TimeSplitDefinition> = {
  toSplitCombine(split: TimeSplitDefinition): SplitCombine {
    const { dimension, limit, sort, granularity } = split;

    const expression = $(dimension);
    const bucketAction: any = new TimeBucketExpression({ duration: Duration.fromJS(granularity) });
    const sortAction = sort && new SortExpression({ expression: $(sort.ref), direction: sortDirectionMapper[sort.direction] });
    const limitAction = limit && new LimitExpression({ value: limit });

    return new SplitCombine({ expression, bucketAction, sortAction, limitAction });
  },

  fromSplitCombine(splitCombine: SplitCombine): TimeSplitDefinition {
    const { expression, bucketAction, sortAction, limitAction } = splitCombine;

    if (bucketAction instanceof TimeBucketExpression) {
      const { name: dimension } = expression as RefExpression;

      return {
        type: SplitType.time,
        dimension,
        granularity: bucketAction.duration.toJS(),
        sort: sortAction && { ref: sortAction.refName(), direction: directionMapper[sortAction.direction] },
        limit: limitAction && limitAction.value
      };
    } else {
      throw new Error("");
    }
  }

};

const stringSplitConversion: SplitDefinitionConversion<StringSplitDefinition> = {
  toSplitCombine(split: StringSplitDefinition): SplitCombine {
    const { dimension, limit, sort } = split;

    const expression = $(dimension);
    const bucketAction: null = null;
    const sortAction = sort && new SortExpression({ expression: $(sort.ref), direction: sortDirectionMapper[sort.direction] });
    const limitAction = limit && new LimitExpression({ value: limit });

    return new SplitCombine({ expression, bucketAction, sortAction, limitAction });
  },

  fromSplitCombine(splitCombine: SplitCombine): StringSplitDefinition {
    const { expression, sortAction, limitAction } = splitCombine;
    const { name: dimension } = expression as RefExpression;

    return {
      type: SplitType.string,
      dimension,
      sort: sortAction && { ref: sortAction.refName(), direction: directionMapper[sortAction.direction] },
      limit: limitAction && limitAction.value
    };
  }
};

const splitConversions: { [type in SplitType]: SplitDefinitionConversion<SplitDefinition> } = {
  number: numberSplitConversion,
  string: stringSplitConversion,
  time: timeSplitConversion
};

export interface SplitDefinitionConverter {
  toSplitCombine(split: SplitDefinition): SplitCombine;

  fromSplitCombine(splitCombine: SplitCombine): SplitDefinition;
}

export const splitConverter: SplitDefinitionConverter = {
  toSplitCombine(split: SplitDefinition): SplitCombine {
    return splitConversions[split.type].toSplitCombine(split);
  },

  fromSplitCombine(splitCombine: SplitCombine): SplitDefinition {
    const { bucketAction } = splitCombine;

    if (bucketAction instanceof NumberBucketExpression) {
      return numberSplitConversion.fromSplitCombine(splitCombine);
    } else if (bucketAction instanceof TimeBucketExpression) {
      return timeSplitConversion.fromSplitCombine(splitCombine);
    } else {
      return stringSplitConversion.fromSplitCombine(splitCombine);
    }
  }
};
