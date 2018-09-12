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

import { Duration, Timezone } from "chronoshift";
import { List, Record, Set } from "immutable";
import { NumberBucketExpression, PlywoodRange, TimeBucketExpression, TimeRange } from "plywood";
import { Unary } from "../../utils/functional/functional";
import { Dimension } from "../dimension/dimension";
import { Dimensions } from "../dimension/dimensions";
import { Filter } from "../filter/filter";
import { getBestBucketUnitForRange, getDefaultGranularityForKind } from "../granularity/granularity";
import { Measures } from "../measure/measures";
import { Sort, Split } from "../split/split";
import { Timekeeper } from "../timekeeper/timekeeper";

export interface SplitsValue {
  splits: List<Split>;
}

const defaultSplits: SplitsValue = { splits: List([]) };

export class Splits extends Record<SplitsValue>(defaultSplits) {

  static fromSplit(split: Split): Splits {
    return new Splits({ splits: List([split]) });
  }

  static fromJS(parameters: any): Splits {
    const splits = List(parameters.splits).map(split => Split.fromJS(split));
    return new Splits({ splits });
  }

  static fromDimensions(dimensions: List<string>): Splits {
    const splits = dimensions.map(reference => new Split({ reference }));
    return new Splits({ splits });
  }

  public toString() {
    return this.splits.map(split => split.toString()).join(",");
  }

  public replaceByIndex(index: number, replace: Split): Splits {
    const { splits } = this;
    if (splits.count() === index) {
      return this.insertByIndex(index, replace);
    }
    return this.updateSplits(splits => {
      const newSplitIndex = splits.findIndex(split => split.equals(replace));
      if (newSplitIndex === -1) return splits.set(index, replace);
      const oldSplit = splits.get(index);
      return splits
        .set(index, replace)
        .set(newSplitIndex, oldSplit);
    });
  }

  public insertByIndex(index: number, insert: Split): Splits {
    return this.updateSplits(splits =>
      splits
        .insert(index, insert)
        .filterNot((split, idx) => split.equals(insert) && idx !== index));
  }

  public addSplit(split: Split): Splits {
    const { splits } = this;
    return this.insertByIndex(splits.count(), split);
  }

  public removeSplit(split: Split): Splits {
    return this.updateSplits(splits => splits.filter(s => s !== split));
  }

  public changeSortExpressionFromNormalized(sort: Sort): Splits {
    return this.updateSplits(splits => splits.map(s => s.changeSortFromNormalized(sort)));
  }

  public length(): number {
    return this.splits.count();
  }

  public getSplit(index: number): Split {
    return this.splits.get(index);
  }

  public findSplitForDimension({ name }: Dimension): Split {
    return this.splits.find(s => s.reference === name);
  }

  public hasSplitOn(dimension: Dimension): boolean {
    return Boolean(this.findSplitForDimension(dimension));
  }

  public replace(search: Split, replace: Split): Splits {
    return this.updateSplits(splits => splits.map(s => s.equals(search) ? replace : s));
  }

  public removeBucketingFrom(references: Set<string>) {
    return this.updateSplits(splits => splits.map(split => {
      if (!split.bucket || !references.has(split.reference)) return split;
      return split.changeBucket(null);
    }));
  }

  public updateWithFilter(filter: Filter, dimensions: Dimensions): Splits {
    const specificFilter = filter.getSpecificFilter(Timekeeper.globalNow(), Timekeeper.globalNow(), Timezone.UTC);

    return this.updateSplits(splits => splits.map(split => {
      const { bucket, reference } = split;
      if (bucket) return split;

      const splitDimension = dimensions.getDimensionByName(reference);
      const splitKind = splitDimension.kind;
      if (!splitDimension || !(splitKind === "time" || splitKind === "number") || !splitDimension.canBucketByDefault()) {
        return split;
      }
      // TODO: calculate extent from specificFilter and don't use plywood range (prolly something inside granularity to fix)
      const extent: PlywoodRange = null;

      if (splitKind === "time") {
        return split.changeBucket(TimeRange.isTimeRange(extent)
          ? (getBestBucketUnitForRange(extent, false, splitDimension.bucketedBy, splitDimension.granularities) as Duration)
          : (getDefaultGranularityForKind("time", splitDimension.bucketedBy, splitDimension.granularities) as TimeBucketExpression).duration
        );

      } else if (splitKind === "number") {
        return split.changeBucket(extent
          ? (getBestBucketUnitForRange(extent, false, splitDimension.bucketedBy, splitDimension.granularities) as number)
          : (getDefaultGranularityForKind("number", splitDimension.bucketedBy, splitDimension.granularities) as NumberBucketExpression).size
        );

      }

      throw new Error("unknown extent type");
    }));
  }

  public constrainToDimensionsAndMeasures(dimensions: Dimensions, measures: Measures): Splits {
    function validSplit(split: Split): boolean {
      if (!dimensions.getDimensionByName(split.reference)) return false;
      if (!split.sort) return true;
      const sortRef = split.sort.reference;
      return dimensions.containsDimensionWithName(sortRef) || measures.containsMeasureWithName(sortRef);
    }

    return this.updateSplits(splits => splits.filter(validSplit));
  }

  public changeSortIfOnMeasure(fromMeasure: string, toMeasure: string): Splits {
    return this.updateSplits(splits => splits.map(split => {
      const { sort } = split;
      if (!sort || sort.reference !== fromMeasure) return split;
      return split.setIn(["sort", "reference"], toMeasure);
    }));
  }

  public getCommonSort(): Sort {
    const { splits } = this;
    if (splits.count() === 0) return null;
    const commonSort = splits.get(0).sort;
    return splits.every(({ sort }) => sort.equals(commonSort)) ? commonSort : null;
  }

  private updateSplits(updater: Unary<List<Split>, List<Split>>) {
    return this.update("splits", updater);
  }
}

export const EMPTY_SPLITS = new Splits({ splits: List([]) });
