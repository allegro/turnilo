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

import { Datum, PlywoodRange } from "plywood";
import { concatTruthy, flatMap, Unary } from "../../../../common/utils/functional/functional";
import { ContinuousRange } from "../utils/continuous-types";

type DataPoint = [number, number];

function areDetached(a: PlywoodRange | null, b: PlywoodRange | null): boolean {
  return a && b && a.end.valueOf() !== b.start.valueOf();
}

function nextMidpoint(range: ContinuousRange): number {
  const rangeWidth = range.end.valueOf() - range.start.valueOf();
  return range.midpoint().valueOf() + rangeWidth;
}

function previousMidpoint(range: ContinuousRange): number {
  const rangeWidth = range.end.valueOf() - range.start.valueOf();
  return range.midpoint().valueOf() - rangeWidth;
}

function shouldInsertPreviousPoint(dataset: Datum[], currentIndex: number, getX: Unary<Datum, ContinuousRange>): boolean {
  const previous = dataset[currentIndex - 1];
  if (!previous) return false;
  const current = dataset[currentIndex];
  return areDetached(getX(previous), getX(current));
}

function shouldInsertNextPoint(dataset: Datum[], currentIndex: number, getX: Unary<Datum, ContinuousRange>): boolean {
  const next = dataset[currentIndex + 1];
  if (!next) return false;
  const current = dataset[currentIndex];
  return areDetached(getX(current), getX(next));
}

export function prepareDataPoints(dataset: Datum[], getX: Unary<Datum, ContinuousRange>, getY: Unary<Datum, number>): DataPoint[] {
  return flatMap(dataset, (datum, index) => {
    const range = getX(datum);
    const x = range.midpoint().valueOf();
    const maybeY = getY(datum);
    const y = isNaN(maybeY) ? 0 : maybeY;

    return concatTruthy<DataPoint>(
      shouldInsertPreviousPoint(dataset, index, getX) && [previousMidpoint(range), 0],
      [x, y],
      shouldInsertNextPoint(dataset, index, getX) && [nextMidpoint(range), 0]
    );
  });
}
