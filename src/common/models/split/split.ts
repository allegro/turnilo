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

import { Duration, Timezone } from "chronoshift";
import { Record } from "immutable";
import { Datum, Expression, NumberBucketExpression, PlywoodValue, TimeBucketExpression } from "plywood";
import { formatValue } from "../../utils/formatter/formatter";
import { isTruthy } from "../../utils/general/general";
import nullableEquals from "../../utils/immutable-utils/nullable-equals";
import { Dimension, DimensionKind } from "../dimension/dimension";
import { DimensionSort, Sort } from "../sort/sort";
import { TimeShiftEnv, TimeShiftEnvType } from "../time-shift/time-shift-env";

export enum SplitType {
  number = "number",
  string = "string",
  time = "time",
  boolean = "boolean"
}

export function isContinuousSplit({ type }: Split): boolean {
  return  type === SplitType.time || type === SplitType.number;
}

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
  sort: new DimensionSort({ reference: null }),
  limit: null
};

export function bucketToAction(bucket: Bucket): Expression {
  return bucket instanceof Duration
    ? new TimeBucketExpression({ duration: bucket })
    : new NumberBucketExpression({ size: bucket });
}

function applyTimeShift(type: SplitType, expression: Expression, env: TimeShiftEnv): Expression {
  if (env.type === TimeShiftEnvType.WITH_PREVIOUS && type === SplitType.time) {
    return env.currentFilter.then(expression).fallback(expression.timeShift(env.shift));
  }
  return expression;
}

export function toExpression({ bucket, type }: Split, { expression }: Dimension, env: TimeShiftEnv): Expression {
  const expWithShift = applyTimeShift(type, expression, env);
  if (!bucket) return expWithShift;
  return expWithShift.performAction(bucketToAction(bucket));
}

export function kindToType(kind: DimensionKind): SplitType {
  switch (kind) {
    case "time":
      return SplitType.time;
    case "number":
      return SplitType.number;
    case "boolean":
      return SplitType.boolean;
    case "string":
      return SplitType.string;
  }
}

export class Split extends Record<SplitValue>(defaultSplit) {

  static fromDimension({ name, kind, limits }: Dimension): Split {
    return new Split({ reference: name, type: kindToType(kind), limit: limits[limits.length - 1] });
  }

  public toString(): string {
    return `[SplitCombine: ${this.reference}]`;
  }

  public toKey(): string {
    return this.reference;
  }

  public changeBucket(bucket: Bucket): Split {
    return this.set("bucket", bucket);
  }

  public changeSort(sort: Sort): Split {
    return this.set("sort", sort);
  }

  public changeLimit(limit: number): Split {
    return this.set("limit", limit);
  }

  public getTitle(dimension: Dimension): string {
    return (dimension ? dimension.title : "?") + this.getBucketTitle();
  }

  public selectValue<T extends PlywoodValue>(datum: Datum): T {
    return datum[this.toKey()] as T;
  }

  public formatValue(datum: Datum, timezone: Timezone): string {
    return formatValue(datum[this.toKey()], timezone);
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

  public equals(other: any): boolean {
    if (this.type !== SplitType.time) return super.equals(other);
    return other instanceof Split &&
      this.type === other.type &&
      this.reference === other.reference &&
      this.sort.equals(other.sort) &&
      this.limit === other.limit &&
      nullableEquals(this.bucket as Duration, other.bucket as Duration);
  }
}
