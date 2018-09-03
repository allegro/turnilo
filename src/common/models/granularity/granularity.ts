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

import { day, Duration, hour, minute, Timezone } from "chronoshift";
import { Expression, ExpressionJS, ExpressionValue, NumberBucketExpression, NumberRange, PlywoodRange, TimeBucketExpression, TimeRange } from "plywood";
import { STRINGS } from "../../../client/config/constants";
import {
  findBiggerClosestToIdeal,
  findExactIndex,
  findFirstBiggerIndex,
  findMaxValueIndex,
  findMinValueIndex,
  getNumberOfWholeDigits,
  hasOwnProperty,
  isDecimalInteger,
  toSignificantDigits
} from "../../../common/utils/general/general";
import { isFloorableDuration, isValidDuration } from "../../utils/plywood/duration";

const MENU_LENGTH = 5;

export type Granularity = TimeBucketExpression | NumberBucketExpression;
export type GranularityJS = string | number | ExpressionJS;
export type BucketUnit = Duration | number;
export type ContinuousDimensionKind = "time" | "number";

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
  returnValue: GranularityJS;
}

function makeCheckpoint(checkPoint: number, returnValue: GranularityJS): Checker {
  return {
    checkPoint,
    returnValue
  };
}

function makeNumberBuckets(centerAround: number, count: number, coarse?: boolean): Granularity[] {
  let granularities: Granularity[] = [];
  let logTen = Math.log(centerAround) / Math.LN10;
  const digits = getNumberOfWholeDigits(centerAround);
  const decimalBase = 10;

  while (granularities.length <= count) {
    if (!coarse) {
      const halfStep = toSignificantDigits(5 * Math.pow(decimalBase, logTen - 1), digits);
      granularities.push(granularityFromJS(halfStep));
    }
    if (granularities.length >= count) break;
    const wholeStep = toSignificantDigits(Math.pow(decimalBase, logTen), digits);
    granularities.push(granularityFromJS(wholeStep));
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

  static minGranularity = granularityFromJS("PT1M");
  static defaultGranularity = granularityFromJS("P1D");

  static supportedGranularities = () => {
    return [
      "PT1S", "PT1M", "PT5M", "PT15M",
      "PT1H", "PT6H", "PT8H", "PT12H",
      "P1D", "P1W", "P1M", "P3M", "P6M",
      "P1Y", "P2Y"
    ].map(granularityFromJS);
  }

  static checkers = [
    makeCheckpoint(days(95), "P1W"),
    makeCheckpoint(days(8), "P1D"),
    makeCheckpoint(hours(8), "PT1H"),
    makeCheckpoint(hours(3), "PT5M")];

  static coarseCheckers = [
    makeCheckpoint(days(95), "P1M"),
    makeCheckpoint(days(20), "P1W"),
    makeCheckpoint(days(6), "P1D"),
    makeCheckpoint(days(2), "PT12H"),
    makeCheckpoint(hours(23), "PT6H"),
    makeCheckpoint(hours(3), "PT1H"),
    makeCheckpoint(minutes(30), "PT5M")
  ];

  static defaultGranularities = TimeHelper.checkers.map(c => granularityFromJS(c.returnValue)).concat(TimeHelper.minGranularity).reverse();
  static coarseGranularities = TimeHelper.coarseCheckers.map(c => granularityFromJS(c.returnValue)).concat(TimeHelper.minGranularity).reverse();
}

export class NumberHelper {
  static dimensionKind: ContinuousDimensionKind = "number";
  static minGranularity = granularityFromJS(1);
  static defaultGranularity = granularityFromJS(10);

  static checkers = [
    makeCheckpoint(5000, 1000),
    makeCheckpoint(500, 100),
    makeCheckpoint(100, 10),
    makeCheckpoint(1, 1),
    makeCheckpoint(0.1, 0.1)
  ];

  static defaultGranularities = NumberHelper.checkers.map((c: any) => granularityFromJS(c.returnValue)).reverse();
  static coarseGranularities: Granularity[] = null;
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

  static supportedGranularities = (bucketedBy: Granularity) => {
    return makeNumberBuckets(getBucketSize(bucketedBy), 10);
  }
}

function getHelperForKind(kind: ContinuousDimensionKind) {
  if (kind === "time") return TimeHelper;
  return NumberHelper;
}

function getHelperForRange(input: PlywoodRange) {
  if (input instanceof TimeRange) return TimeHelper;
  return NumberHelper;
}

function getBucketSize(input: Granularity): number {
  if (input instanceof TimeBucketExpression) return input.duration.getCanonicalLength();
  if (input instanceof NumberBucketExpression) return input.size;
  throw new Error(`unrecognized granularity: ${input} must be of type TimeBucketAction or NumberBucketAction`);
}

function getBucketUnit(input: Granularity): BucketUnit {
  if (input instanceof TimeBucketExpression) return input.duration;
  if (input instanceof NumberBucketExpression) return input.size;
  throw new Error(`unrecognized granularity: ${input} must be of type TimeBucketAction or NumberBucketAction`);
}

function bucketUnitToGranularity(input: BucketUnit): Granularity {
  if (input instanceof Duration) {
    return new TimeBucketExpression({ duration: input });
  } else if (!isNaN(input)) {
    return new NumberBucketExpression({ size: input, offset: 0 });
  }
  throw new Error(`unrecognized bucket unit: ${input} must be of type number or Duration`);
}

function startValue(input: PlywoodRange): number {
  return input instanceof TimeRange ? input.start.valueOf() : input.start as number;
}

function endValue(input: PlywoodRange): number {
  return input instanceof TimeRange ? input.end.valueOf() : input.end as number;
}

function findBestMatch(array: Granularity[], target: Granularity) {
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

function generateGranularitySet(allGranularities: Granularity[], bucketedBy: Granularity) {
  const start = findFirstBiggerIndex(allGranularities, bucketedBy, getBucketSize);
  const returnGranularities = allGranularities.slice(start, start + MENU_LENGTH);
  // makes sure the bucket is part of the list
  if (findExactIndex(returnGranularities, bucketedBy, getBucketSize) === -1) {
    return [bucketedBy].concat(returnGranularities.slice(0, returnGranularities.length - 1));
  }
  return returnGranularities;
}

export function granularityFromJS(input: GranularityJS): Granularity {
  if (typeof input === "number") return NumberBucketExpression.fromJS({ size: input });
  if (typeof input === "string") return TimeBucketExpression.fromJS({ duration: input });

  if (typeof input === "object") {
    if (!hasOwnProperty(input, "op")) {
      throw new Error("could not recognize object as expression");
    }
    return (Expression.fromJS(input as ExpressionJS) as Granularity);
  }
  throw new Error("input should be of type number, string, or action");
}

export function granularityToString(input: Granularity): string {
  if (input instanceof TimeBucketExpression) {
    return input.duration.toString();
  } else if (input instanceof NumberBucketExpression) {
    return input.size.toString();
  }

  throw new Error(`unrecognized granularity: ${input} must be of type TimeBucketAction or NumberBucketAction`);
}

export function granularityEquals(g1: Granularity, g2: Granularity) {
  if (!Boolean(g1) === Boolean(g2)) return false;
  if (g1 === g2) return true;
  return (g1 as Expression).equals(g2 as Expression);
}

export function granularityToJS(input: Granularity): GranularityJS {
  const js = input.toJS();

  if (js.action === "timeBucket") {
    if (Object.keys(js).length === 2) return js.duration;
  }

  if (js.action === "numberBucket") {
    if (Object.keys(js).length === 2) return js.size;
  }

  return js;
}

export function updateBucketSize(existing: Granularity, newInput: Granularity): Granularity {
  if (newInput instanceof TimeBucketExpression) {
    return new TimeBucketExpression({
      duration: (newInput as TimeBucketExpression).duration,
      timezone: (existing as TimeBucketExpression).timezone
    });
  } else if (newInput instanceof NumberBucketExpression) {
    const value: ExpressionValue = { size: (newInput as NumberBucketExpression).size };
    if ((existing as NumberBucketExpression).offset) value.offset = (existing as NumberBucketExpression).offset;
    return new NumberBucketExpression(value);
  }
  throw new Error(`unrecognized granularity: ${newInput} must be of type TimeBucket or NumberBucket`);
}

export function getGranularities(kind: ContinuousDimensionKind, bucketedBy?: Granularity, coarse?: boolean): Granularity[] {
  const kindHelper = getHelperForKind(kind);
  const coarseGranularities = kindHelper.coarseGranularities;
  if (!bucketedBy) return coarse && coarseGranularities ? coarseGranularities : kindHelper.defaultGranularities;
  // make list that makes most sense with bucket
  const allGranularities = kindHelper.supportedGranularities(bucketedBy);
  return generateGranularitySet(allGranularities, bucketedBy);
}

export function getDefaultGranularityForKind(kind: ContinuousDimensionKind, bucketedBy?: Granularity, customGranularities?: Granularity[]): Granularity {
  if (bucketedBy) return bucketedBy;
  if (customGranularities) return customGranularities[2];
  return getHelperForKind(kind).defaultGranularity;
}

export function getBestGranularityForRange(inputRange: PlywoodRange, bigChecker: boolean, bucketedBy?: Granularity, customGranularities?: Granularity[]): Granularity {
  return bucketUnitToGranularity(getBestBucketUnitForRange(inputRange, bigChecker, bucketedBy, customGranularities));
}

export function getBestBucketUnitForRange(inputRange: PlywoodRange, bigChecker: boolean, bucketedBy?: Granularity, customGranularities?: Granularity[]): BucketUnit {
  const rangeLength = Math.abs(endValue(inputRange) - startValue(inputRange));

  const rangeHelper = getHelperForRange(inputRange);
  const bucketLength = bucketedBy ? getBucketSize(bucketedBy) : 0;
  const checkPoints = bigChecker && rangeHelper.coarseCheckers ? rangeHelper.coarseCheckers : rangeHelper.checkers;

  for (const { checkPoint, returnValue } of checkPoints) {
    const returnVal = granularityFromJS(returnValue);
    if (rangeLength > checkPoint || bucketLength > checkPoint) {

      if (bucketedBy) {
        const granArray = customGranularities || getGranularities(rangeHelper.dimensionKind, bucketedBy);
        const closest = findBiggerClosestToIdeal(granArray, bucketedBy, returnVal, getBucketSize);
        // this could happen if bucketedBy were very big or if custom granularities are smaller than maker action
        if (closest === null) return getBucketUnit(rangeHelper.defaultGranularity);
        return getBucketUnit(closest);
      } else {
        if (!customGranularities) return getBucketUnit(returnVal);
        return getBucketUnit(findBestMatch(customGranularities, returnVal));
      }
    }
  }

  const minBucket = customGranularities ? customGranularities[findMinValueIndex(customGranularities, getBucketSize)] : rangeHelper.minGranularity;
  const granularity = bucketLength > getBucketSize(minBucket) ? bucketedBy : minBucket;
  return getBucketUnit(granularity);
}

export function getLineChartTicks(range: PlywoodRange, timezone: Timezone): Array<Date | number> {
  if (range instanceof TimeRange) {
    const { start, end } = range as TimeRange;
    const tickDuration = getBestBucketUnitForRange(range as TimeRange, true) as Duration;
    return tickDuration.materialize(start, end, timezone);
  } else {
    const { start, end } = range as NumberRange;
    const unit = getBestBucketUnitForRange(range as NumberRange, true) as number;
    let values: number[] = [];
    let iter = Math.round(start * unit) / unit;

    while (iter <= end) {
      values.push(iter);
      iter += unit;
    }
    return values;
  }
}
