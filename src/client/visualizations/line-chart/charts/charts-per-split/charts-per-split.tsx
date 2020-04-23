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

import { Dataset, Datum } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { Stage } from "../../../../../common/models/stage/stage";
import { compose, Unary } from "../../../../../common/utils/functional/functional";
import { LegendSpot } from "../../../../components/pinboard-panel/pinboard-panel";
import { SPLIT } from "../../../../config/constants";
import { SeriesLegend } from "../../legend/series-legend";
import { ContinuousTicks } from "../../utils/pick-x-axis-ticks";
import { ContinuousScale } from "../../utils/scale";
import { hasNominalSplit } from "../../utils/splits";
import { calculateChartStage } from "../calculate-chart-stage";
import { SplitChart } from "./split-chart";

interface ChartsPerSplit {
  essence: Essence;
  dataset: Dataset;
  xScale: ContinuousScale;
  xTicks: ContinuousTicks;
  stage: Stage;
}

function getChartsSelectors(essence: Essence, dataset: Dataset): Array<Unary<Dataset, Datum>> {
  const get1stLevel = (dataset: Dataset) => dataset.data[0];
  if (!hasNominalSplit(essence)) {
    return [get1stLevel];
  }

  const splitDatums = (get1stLevel(dataset)[SPLIT] as Dataset).data;
  return splitDatums.map((datum, index) => {
    const get2ndLevel = (datum: Datum) => (datum[SPLIT] as Dataset).data[index];
    return compose<Dataset, Datum, Datum>(get1stLevel, get2ndLevel);
  });
}

export const ChartsPerSplit: React.SFC<ChartsPerSplit> = props => {
  const { xScale, xTicks, essence, dataset, stage } = props;

  const hasMultipleSeries = essence.series.count() > 1;
  const selectors = getChartsSelectors(essence, dataset);
  const chartStage = calculateChartStage(stage, selectors.length);
  return <React.Fragment>
    {hasMultipleSeries && <LegendSpot>
      <SeriesLegend essence={essence} />
    </LegendSpot>}
    {selectors.map(selector => <SplitChart
      essence={essence}
      dataset={dataset}
      selectDatum={selector}
      xScale={xScale}
      xTicks={xTicks}
      chartStage={chartStage} />)}
  </React.Fragment>;
};
