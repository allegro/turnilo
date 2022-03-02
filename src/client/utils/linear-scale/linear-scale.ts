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

import * as d3 from "d3";

export type LinearScale = d3.ScaleLinear<number, number>;

export const TICKS_COUNT = 5;

export function pickTicks(scale: LinearScale, ticksCount = TICKS_COUNT): number[] {
  return scale.ticks(ticksCount).filter(n => n !== 0);
}

export default function getScale([min, max]: number[], height: number): LinearScale | null {
  if (isNaN(min) || isNaN(max)) {
    return null;
  }

  return d3.scaleLinear()
    .domain([Math.min(min, 0), Math.max(max, 0)])
    .nice(TICKS_COUNT)
    .range([height, 0]);
}
