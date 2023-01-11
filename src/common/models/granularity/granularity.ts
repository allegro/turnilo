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

import { day, Duration, hour, minute } from "chronoshift";
import { STRINGS } from "../../../client/config/constants";
import {
  findBiggerClosestToIdeal,
  findExactIndex,
  findFirstBiggerIndex,
  findMaxValueIndex,
  findMinValueIndex,
  getNumberOfWholeDigits,
  isDecimalInteger,
  toSignificantDigits
} from "../../utils/general/general";
import { isFloorableDuration, isValidDuration } from "../../utils/plywood/duration";
import { DimensionKind } from "../dimension/dimension";
import { Bucket } from "../split/split";

const MENU_LENGTH = 5;

export type GranularityJS = string | number;
export type ContinuousDimensionKind = "time" | "number";

type BucketableRange = { start: number, end: number } | { start: Date, end: Date };

export function validateGranularity(kind: string, granularity: string): string {
  if (kind === "time") {
    if (!isValidDuration(granularity)) {
      return STRINGS.invalidDurationFormat;
    }
    if (!isFloorableDuration(granularity)) {
      return STRINGS.notFloorableDuration;
    }
  }
  if (kind === "number" && !isDecimalInteger(granularity)) {
    return STRINGS.invalidNumberFormat;
  }
  return null;
}

export function isGranularityValid(kind: string, granularity: string): boolean {
  return validateGranularity(kind, granularity) === null;
}

export interface Checker {
  checkPoint: number;
  returnValue: Bucket;
}

function makeCheckpoint(checkPoint: number, returnValue: Bucket): Checker {
  return { checkPoint, returnValue };
}

function makeNumberBuckets(centerAround: number, count: number, coarse?: boolean): number[] {
  const granularities: number[] = [];
  let logTen = Math.log(centerAround) / Math.LN10;
  const digits = getNumberOfWholeDigits(centerAround);
  const decimalBase = 10;

  while (granularities.length <= count) {
    if (!coarse) {
      const halfStep = toSignificantDigits(5 * Math.pow(decimalBase, logTen - 1), digits);
      granularities.push(halfStep);
    }
    if (granularities.length >= count) break;
    const wholeStep = toSignificantDigits(Math.pow(decimalBase, logTen), digits);
    granularities.push(wholeStep);
    logTen++;
  }

  return granularities;
}

function days(count: number) {
  return count * day.canonicalLength;
}

function hours(count: number) {
  return count * hour.canonicalLength;
}

function minutes(count: number) {
  return count * minute.canonicalLength;
}

export class TimeHelper {
  static dimensionKind: ContinuousDimensionKind = "time";

  static minGranularity = Duration.fromJS("PT1M");
  static defaultGranularity = Duration.fromJS("P1D");

  static supportedGranularities = (_: Bucket): Bucket[] => {
    return [
      "PT1S", "PT1M", "PT5M", "PT15M",
      "PT1H", "PT6H", "PT8H", "PT12H",
      "P1D", "P1W", "P1M", "P3M", "P6M",
      "P1Y", "P2Y"
    ].map(duration => Duration.fromJS(duration));
  }

  static checkers = [
    makeCheckpoint(days(95), Duration.fromJS("P1W")),
    makeCheckpoint(days(8), Duration.fromJS("P1D")),
    makeCheckpoint(hours(8), Duration.fromJS("PT1H")),
    makeCheckpoint(hours(3), Duration.fromJS("PT5M"))];

  static coarseCheckers = [
    makeCheckpoint(days(95), Duration.fromJS("P1M")),
    makeCheckpoint(days(20), Duration.fromJS("P1W")),
    makeCheckpoint(days(6), Duration.fromJS("P1D")),
    makeCheckpoint(days(2), Duration.fromJS("PT12H")),
    makeCheckpoint(hours(23), Duration.fromJS("PT6H")),
    makeCheckpoint(hours(3), Duration.fromJS("PT1H")),
    makeCheckpoint(minutes(30), Duration.fromJS("PT5M"))
  ];

  static defaultGranularities = TimeHelper.checkers.map(c => c.returnValue).concat(TimeHelper.minGranularity).reverse();
  static coarseGranularities = TimeHelper.coarseCheckers.map(c => c.returnValue).concat(TimeHelper.minGranularity).reverse();
}

export class NumberHelper {
  static dimensionKind: ContinuousDimensionKind = "number";
  static minGranularity = 1;
  static defaultGranularity = 10;

  static checkers = [
    makeCheckpoint(5000, 1000),
    makeCheckpoint(500, 100),
    makeCheckpoint(100, 10),
    makeCheckpoint(1, 1),
    makeCheckpoint(0.1, 0.1)
  ];

  static defaultGranularities = NumberHelper.checkers.map((c: any) => c.returnValue).reverse();
  static coarseGranularities: Bucket[] = null;
  static coarseCheckers: Checker[] = [
    makeCheckpoint(500000, 50000),
    makeCheckpoint(50000, 10000),
    makeCheckpoint(5000, 5000),
    makeCheckpoint(1000, 1000),
    makeCheckpoint(100, 100),
    makeCheckpoint(10, 10),
    makeCheckpoint(1, 1),
    makeCheckpoint(0.1, 0.1)
  ];

  static supportedGranularities = (bucketedBy: Bucket): Bucket[] => {
    return makeNumberBuckets(getBucketSize(bucketedBy), 10);
  }
}

function getHelperForKind(kind: ContinuousDimensionKind) {
  if (kind === "time") return TimeHelper;
  return NumberHelper;
}

function getHelperForRange({ start }: BucketableRange) {
  if (start instanceof Date) return TimeHelper;
  return NumberHelper;
}

function getBucketSize(input: Bucket): number {
  if (input instanceof Duration) return input.getCanonicalLength();
  if (typeof input === "number") return input;
  throw new Error(`unrecognized granularity: ${input} must be number or Duration`);
}

function startValue({ start }: BucketableRange): number {
  return start instanceof Date ? start.valueOf() : start;
}

function endValue({ end }: BucketableRange): number {
  return end instanceof Date ? end.valueOf() : end;
}

function findBestMatch(array: Bucket[], target: Bucket) {
  const exactMatch = findExactIndex(array, target, getBucketSize);
  if (exactMatch !== -1) {
    return array[exactMatch];
  }
  const minBiggerIdx = findFirstBiggerIndex(array, target, getBucketSize);
  if (minBiggerIdx !== -1) {
    return array[minBiggerIdx];
  }
  return array[findMaxValueIndex(array, getBucketSize)];
}

function generateGranularitySet(allGranularities: Bucket[], bucketedBy: Bucket) {
  const start = findFirstBiggerIndex(allGranularities, bucketedBy, getBucketSize);
  const returnGranularities = allGranularities.slice(start, start + MENU_LENGTH);
  // makes sure the bucket is part of the list
  if (findExactIndex(returnGranularities, bucketedBy, getBucketSize) === -1) {
    return [bucketedBy].concat(returnGranularities.slice(0, returnGranularities.length - 1));
  }
  return returnGranularities;
}

export function granularityFromJS(input: GranularityJS): Bucket {
  if (typeof input === "number") return input;
  if (isValidDuration(input)) return Duration.fromJS(input);
  throw new Error("input should be number or Duration");
}

export function coerceGranularity(granularity: string, kind: DimensionKind): Bucket | null {
  switch (kind) {
    case "string":
      return null;
    case "boolean":
      return null;
    case "time":
      return Duration.fromJS(granularity);
    case "number":
      return parseInt(granularity, 10);
  }
}

export function granularityToString(input: Bucket): string {
  return input.toString();
}

export function formatGranularity(bucket: Bucket): string {
  if (bucket instanceof Duration) {
    return `${bucket.getSingleSpanValue()}${bucket.getSingleSpan().charAt(0).toUpperCase()}`;
  }
  return bucket.toString();
}

export function granularityEquals(g1: Bucket, g2: Bucket) {
  if (g1 instanceof Duration) {
    try {
      return g1.equals(g2 as Duration);
    } catch {
      return false;
    }
  }
  return g1 === g2;
}

export function getGranularities(kind: ContinuousDimensionKind, bucketedBy?: Bucket, coarse?: boolean): Bucket[] {
  const kindHelper = getHelperForKind(kind);
  const coarseGranularities = kindHelper.coarseGranularities;
  if (!bucketedBy) return coarse && coarseGranularities ? coarseGranularities : kindHelper.defaultGranularities;
  // make list that makes most sense with bucket
  const allGranularities: Bucket[] = kindHelper.supportedGranularities(bucketedBy);
  return generateGranularitySet(allGranularities, bucketedBy);
}

export function getDefaultGranularityForKind(kind: ContinuousDimensionKind, bucketedBy?: Bucket, customGranularities?: Bucket[]): Bucket {
  if (bucketedBy) return bucketedBy;
  if (customGranularities) return customGranularities[2];
  return getHelperForKind(kind).defaultGranularity;
}

export function getBestBucketUnitForRange(inputRange: BucketableRange, bigChecker: boolean, bucketedBy?: Bucket, customGranularities?: Bucket[]): Bucket {
  const rangeLength = Math.abs(endValue(inputRange) - startValue(inputRange));

  const rangeHelper = getHelperForRange(inputRange);
  const bucketLength = bucketedBy ? getBucketSize(bucketedBy) : 0;
  const checkPoints = bigChecker && rangeHelper.coarseCheckers ? rangeHelper.coarseCheckers : rangeHelper.checkers;

  for (const { checkPoint, returnValue } of checkPoints) {
    if (rangeLength > checkPoint || bucketLength > checkPoint) {

      if (bucketedBy) {
        const granArray = customGranularities || getGranularities(rangeHelper.dimensionKind, bucketedBy);
        const closest = findBiggerClosestToIdeal(granArray, bucketedBy, returnValue, getBucketSize);
        // this could happen if bucketedBy were very big or if custom granularities are smaller than maker action
        if (closest === null) return rangeHelper.defaultGranularity;
        return closest;
      } else {
        if (!customGranularities) return returnValue;
        return findBestMatch(customGranularities, returnValue);
      }
    }
  }

  const minBucket = customGranularities ? customGranularities[findMinValueIndex(customGranularities, getBucketSize)] : rangeHelper.minGranularity;
  return bucketLength > getBucketSize(minBucket) ? bucketedBy : minBucket;
}
