/*
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
import * as d3 from "d3";
import { Datum } from "plywood";
import { ConcreteSeries, SeriesDerivation } from "../../../common/models/series/concrete-series";
import { Unary } from "../../../common/utils/functional/functional";
import { readNumber } from "../../../common/utils/general/general";

export type Selector = Unary<Datum, number>;
export type Extent = [number, number];

export function seriesSelectors(series: ConcreteSeries, hasComparison: boolean): Selector[] {
  const get = (d: Datum) => readNumber(series.selectValue(d));
  if (!hasComparison) return [get];
  return [
    get,
    (d: Datum) => readNumber(series.selectValue(d, SeriesDerivation.PREVIOUS))
  ];
}

export function datumsExtent(datums: Datum[], selectors: Selector[]): Extent {
  return selectors.reduce((acc, selector) => {
    const extent =  d3.extent(datums, selector);
    return d3.extent([...extent, ...acc]);
  }, [0, 0]) as Extent;
}
