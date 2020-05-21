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

import { Dataset } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { Stage } from "../../../../../common/models/stage/stage";
import { LegendSpot } from "../../../../components/pinboard-panel/pinboard-panel";
import { InteractionsProps } from "../../interactions/interaction-controller";
import { SplitLegend } from "../../legend/split-legend";
import { ContinuousScale } from "../../utils/continuous-types";
import { ContinuousTicks } from "../../utils/pick-x-axis-ticks";
import { hasNominalSplit } from "../../utils/splits";
import { calculateChartStage } from "../calculate-chart-stage";
import { SeriesChart } from "./series-chart";

interface ChartsPerSeriesProps {
  interactions: InteractionsProps;
  essence: Essence;
  dataset: Dataset;
  xScale: ContinuousScale;
  xTicks: ContinuousTicks;
  stage: Stage;
}

export const ChartsPerSeries: React.SFC<ChartsPerSeriesProps> = props => {
  const { interactions, xScale, xTicks, essence, dataset, stage } = props;

  const concreteSeries = essence.getConcreteSeries().toArray();
  const chartStage = calculateChartStage(stage, essence.series.count());

  return <React.Fragment>
    {hasNominalSplit(essence) && <LegendSpot>
      <SplitLegend dataset={dataset} essence={essence}/>
    </LegendSpot>}
    {concreteSeries.map(series => {
      const key = series.reactKey();
      return <SeriesChart
          interactions={interactions}
          key={key}
          chartId={key}
          dataset={dataset}
          essence={essence}
          series={series}
          chartStage={chartStage}
          visualisationStage={stage}
          xScale={xScale}
          xTicks={xTicks} />;
      }
    )}
  </React.Fragment>;
};
