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

import { Timezone } from "chronoshift";
import { List, Record, Set } from "immutable";
import { Unary } from "../../utils/functional/functional";
import { Dimension } from "../dimension/dimension";
import { Dimensions } from "../dimension/dimensions";
import { FixedTimeFilterClause, NumberFilterClause } from "../filter-clause/filter-clause";
import { Filter } from "../filter/filter";
import { getBestBucketUnitForRange, getDefaultGranularityForKind } from "../granularity/granularity";
import { SeriesList } from "../series-list/series-list";
import { DimensionSort, isSortEmpty, Sort, SortType } from "../sort/sort";
import { Split } from "../split/split";
import { Timekeeper } from "../timekeeper/timekeeper";

export interface SplitsValue {
  splits: List<Split>;
}

const defaultSplits: SplitsValue = { splits: List([]) };

export class Splits extends Record<SplitsValue>(defaultSplits) {

  static fromSplit(split: Split): Splits {
    return new Splits({ splits: List([split]) });
  }

  static fromSplits(splits: Split[]): Splits {
    return new Splits({ splits: List(splits) });
  }

  static fromDimensions(dimensions: List<Dimension>): Splits {
    const splits = dimensions.map(dimension => Split.fromDimension(dimension));
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
    return this.updateSplits(splits => splits.filter(s => s.reference !== split.reference));
  }

  public changeSort(sort: Sort): Splits {
    return this.updateSplits(splits => splits.map(s => s.changeSort(sort)));
  }

  public setSortToDimension(): Splits {
    return this.updateSplits(splits =>
      splits.map(split =>
        split.changeSort(new DimensionSort({ reference: split.reference }))));
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
      if (splitKind === "time") {
        const clause = specificFilter.clauses.find(clause => clause instanceof FixedTimeFilterClause) as FixedTimeFilterClause;
        return split.changeBucket(clause
          ? getBestBucketUnitForRange(clause.values.first(), false, splitDimension.bucketedBy, splitDimension.granularities)
          : getDefaultGranularityForKind("time", splitDimension.bucketedBy, splitDimension.granularities)
        );

      } else if (splitKind === "number") {
        const clause = specificFilter.clauses.find(clause => clause instanceof NumberFilterClause) as NumberFilterClause;
        return split.changeBucket(clause
          ? getBestBucketUnitForRange(clause.values.first(), false, splitDimension.bucketedBy, splitDimension.granularities)
          : getDefaultGranularityForKind("number", splitDimension.bucketedBy, splitDimension.granularities)
        );

      }

      throw new Error("unknown extent type");
    }));
  }

  public constrainToDimensionsAndSeries(dimensions: Dimensions, series: SeriesList): Splits {
    function validSplit(split: Split): boolean {
      if (!dimensions.getDimensionByName(split.reference)) return false;
      if (isSortEmpty(split.sort)) return true;
      const sortRef = split.sort.reference;
      return dimensions.containsDimensionWithName(sortRef) || series.hasSeriesWithKey(sortRef);
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

  public slice(from: number, to?: number) {
    return this.updateSplits(splits => splits.slice(from, to));
  }
}

export const EMPTY_SPLITS = new Splits({ splits: List([]) });
