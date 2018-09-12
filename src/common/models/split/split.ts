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
import { Record } from "immutable";
import { $, Expression, NumberBucketExpression, TimeBucketExpression } from "plywood";
import { isTruthy } from "../../utils/general/general";
import { SortDirection, SplitType } from "../../view-definitions/version-3/split-definition";
import { Dimension } from "../dimension/dimension";

export const SORT_ON_DIMENSION_PLACEHOLDER = "__SWIV_SORT_ON_DIMENSIONS__";

interface SortDefinition {
  reference: string;
  direction: SortDirection;
}

export type Sort = Record<SortDefinition> & Readonly<SortDefinition>;

export const createSort = Record<SortDefinition>({ reference: null, direction: null });

export type Bucket = number | Duration;

export interface SplitValue {
  type: SplitType;
  reference: string;
  // TODO: capture better in type
  bucket: Bucket;
  sort: Sort;
  limit: number;
}

const defaultSplit: SplitValue = {
  type: SplitType.string,
  reference: null,
  bucket: null,
  sort: createSort(),
  limit: null
};

export function toExpression({ reference, bucket }: Split, filter?: Expression, shift?: Duration) {
  const ref = $(reference);
  const withShift = shift && filter;
  const expression = withShift ? filter.then(ref).fallback(ref.timeShift((shift))) : ref;
  if (!bucket) return expression;
  const bucketAction = bucket instanceof Duration
    ? new TimeBucketExpression({ duration: bucket })
    : new NumberBucketExpression({ size: bucket });
  return expression.performAction(bucketAction);
}

export class Split extends Record<SplitValue>(defaultSplit) {

  static fromDimension({ name }: Dimension): Split {
    return new Split({ reference: name });
  }

  static fromJS({ type, reference, bucket, sort, limit }: any): Split {
    return new Split({
      type,
      reference,
      bucket: type === SplitType.time ? Duration.fromJS(bucket) : bucket,
      limit,
      sort: createSort(sort)
    });
  }

  public toString(): string {
    return `[SplitCombine: ${this.reference}]`;
  }

  public toKey(): string {
    return this.reference;
  }

  public getNormalizedSortExpression(): Sort {
    const { sort } = this;
    if (!sort) return null;
    if (sort.reference === this.reference) {
      return sort.set("reference", SORT_ON_DIMENSION_PLACEHOLDER);
    }
    return sort;
  }

  public changeBucket(bucket: Bucket): Split {
    return this.set("bucket", bucket);
  }

  public changeSort(sort: Sort): Split {
    return this.set("sort", sort);
  }

  public changeSortFromNormalized(sort: Sort): Split {
    if (sort.reference === SORT_ON_DIMENSION_PLACEHOLDER) {
      return this.changeSort(sort.set("reference", this.reference));
    }
    return this.changeSort(sort);
  }

  public changeLimit(limit: number): Split {
    return this.set("limit", limit);
  }

  public getTitle(dimension: Dimension): string {
    return (dimension ? dimension.title : "?") + this.getBucketTitle();
  }

  public getBucketTitle(): string {
    const { bucket } = this;
    if (!isTruthy(bucket)) {
      return "";
    }
    if (bucket instanceof Duration) {
      return ` (${bucket.getDescription(true)})`;
    }
    return ` (by ${bucket})`;
  }
}
