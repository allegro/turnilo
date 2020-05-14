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
import { Essence } from "../../../../common/models/essence/essence";
import { ConcreteSeries, SeriesDerivation } from "../../../../common/models/series/concrete-series";
import { flatMap, Unary } from "../../../../common/utils/functional/functional";
import { readNumber } from "../../../../common/utils/general/general";
import { selectSplitDataset } from "./dataset";
import { hasNominalSplit } from "./splits";

type Getter = Unary<Datum, number>;
type Extent = [number, number];

function seriesSelectors(series: ConcreteSeries, hasComparison: boolean): Getter[] {
  const get = (d: Datum) => readNumber(series.selectValue(d));
  if (!hasComparison) return [get];
  return [
    get,
    (d: Datum) => readNumber(series.selectValue(d, SeriesDerivation.PREVIOUS))
  ];
}

function datumsExtent(datums: Datum[], getters: Getter[]): Extent {
  return getters.reduce((acc, getter) => {
    const extent =  d3.extent(datums, getter);
    return d3.extent([...extent, ...acc]);
  }, [0, 0]) as Extent;
}

export function extentAcrossSeries(dataset: Dataset, essence: Essence): Extent {
  const hasComparison = essence.hasComparison();
  const series = essence.getConcreteSeries().toArray();
  const getters = flatMap(series, s => seriesSelectors(s, hasComparison));
  return datumsExtent(dataset.data, getters);
}

export function extentAcrossSplits(dataset: Dataset, essence: Essence, series: ConcreteSeries): Extent {
  const getters = seriesSelectors(series, essence.hasComparison());
  if (hasNominalSplit(essence)) {
    return dataset.data.reduce((acc, datum) => {
      const splitDataset = selectSplitDataset(datum);
      if (!splitDataset) return acc;
      const extent = datumsExtent(splitDataset.data, getters);
      return d3.extent([...acc, ...extent]);
    }, [0, 0]) as Extent;
  }

  return datumsExtent(dataset.data, getters);
}
