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

import { Datum } from "plywood";
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { mapSplitDatums } from "../../../../utils/dataset/split/map-split-datums";
import { StackedBarChartModel } from "./bar-chart-model";
import { stack } from "./stack-layout";

const reverse = (datums: Datum[]): Datum[] => datums.slice().reverse();

const reverseSplitDatums = (datum: Datum) => mapSplitDatums(datum, reverse);

export function stackDataset(dataset: Datum[], { series, hasComparison }: StackedBarChartModel): Datum[] {
  const seriesList = series.toArray();
  const reversedDatums = dataset.map(reverseSplitDatums);
  return seriesList.reduce((datums: Datum[], series: ConcreteSeries) =>
    stack(datums, series, hasComparison), reversedDatums);
}
