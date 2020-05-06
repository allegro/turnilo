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

export function prepareDataPoints(dataset: Datum[], getX: Unary<Datum, ContinuousRange>, getY: Unary<Datum, number>): DataPoint[] {
  return flatMap(dataset, (datum, index) => {
    const range = getX(datum);
    const rangeWidth = range.end.valueOf() - range.start.valueOf();
    const x = range.midpoint().valueOf();
    const y = getY(datum);
    const previous = dataset[index - 1];
    const next = dataset[index + 1];

    return concatTruthy(
      previous && areDetached(getX(previous), range) && [x - rangeWidth, 0] as DataPoint,
      [x, isNaN(y) ? 0 : y] as DataPoint,
      next && areDetached(range, getX(next)) && [x + rangeWidth, 0] as DataPoint
    );
  });
}
