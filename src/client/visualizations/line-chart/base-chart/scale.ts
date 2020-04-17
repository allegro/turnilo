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

export default function getScale(extent: number[], height: number): d3.scale.Linear<number, number> {
  if (isNaN(extent[0]) || isNaN(extent[1])) {
    return null;
  }

  return d3.scale.linear()
    .domain([Math.min(extent[0] * 1.1, 0), Math.max(extent[1] * 1.1, 0)])
    .range([height, 0]);
}
