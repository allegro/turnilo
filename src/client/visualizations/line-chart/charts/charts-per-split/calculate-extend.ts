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
import { Dataset, Datum } from "plywood";
import { Essence } from "../../../../../common/models/essence/essence";
import { ConcreteSeries, SeriesDerivation } from "../../../../../common/models/series/concrete-series";
import { flatMap, Unary } from "../../../../../common/utils/functional/functional";
import { readNumber } from "../../../../../common/utils/general/general";

function seriesSelectors(series: ConcreteSeries, hasComparison: boolean): Array<Unary<Datum, number>> {
  const get = (d: Datum) => readNumber(series.selectValue(d));
  if (!hasComparison) return [get];
  return [
    get,
    (d: Datum) => readNumber(series.selectValue(d, SeriesDerivation.PREVIOUS))
  ];
}

export default function calculateExtend(dataset: Dataset, essence: Essence): [number, number] {
  const datums = dataset.data;
  const hasComparison = essence.hasComparison();
  const series = essence.getConcreteSeries().toArray();
  const getters = flatMap(series, s => seriesSelectors(s, hasComparison));
  return getters.reduce(([accMin, accMax], getter) => {
    const [currMin, currMax] =  d3.extent(datums, getter);
    return [d3.min([accMax, currMin]), d3.max([currMax, accMax])];
  }, [0, 0]) as [number, number];
}
