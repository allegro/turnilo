/*
 * Copyright 2017-2021 Allegro.pl
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
import { Map } from "immutable";
import { Datum, PseudoDatum } from "plywood";
import { Essence } from "../../../../common/models/essence/essence";

export function getScalesForColumns(essence: Essence, flatData: PseudoDatum[]): Map<string, d3.ScaleLinear<number, number>> {
  return essence.getConcreteSeries()
    .groupBy(series => series.reactKey())
    .map(seriesCollection => seriesCollection.first())
    .toMap()
    .map(series => {
    const measureValues = flatData.map((d: Datum) => series.selectValue(d));

    return d3.scaleLinear()
      // Ensure that 0 is in there
      .domain(d3.extent([0, ...measureValues]))
      .range([0, 100]);
  });
}
