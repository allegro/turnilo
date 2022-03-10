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
import React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { Stage } from "../../../../../common/models/stage/stage";
import { compose, Unary } from "../../../../../common/utils/functional/functional";
import { LegendSpot } from "../../../../components/pinboard-panel/pinboard-panel";
import { selectFirstSplitDatums, selectMainDatum, selectSplitDatums } from "../../../../utils/dataset/selectors/selectors";
import { InteractionsProps } from "../../interactions/interaction-controller";
import { SeriesLegend } from "../../legend/series-legend";
import { ContinuousScale } from "../../utils/continuous-types";
import { ContinuousTicks } from "../../utils/pick-x-axis-ticks";
import { hasNominalSplit } from "../../utils/splits";
import { calculateChartStage } from "../calculate-chart-stage";
import { nominalValueKey } from "./nominal-value-key";
import { SplitChart } from "./split-chart";

interface ChartsPerSplit {
  interactions: InteractionsProps;
  essence: Essence;
  dataset: Dataset;
  xScale: ContinuousScale;
  xTicks: ContinuousTicks;
  stage: Stage;
}

function getChartsSelectors(essence: Essence, dataset: Dataset): Array<Unary<Dataset, Datum>> {
  if (!hasNominalSplit(essence)) {
    return [selectMainDatum];
  }

  const splitDatums = selectFirstSplitDatums(dataset);
  return splitDatums.map((datum, index) => {
    const getNthDatum = compose(selectSplitDatums, datums => datums[index]);
    return compose<Dataset, Datum, Datum>(selectMainDatum, getNthDatum);
  });
}

export const ChartsPerSplit: React.FunctionComponent<ChartsPerSplit> = props => {
  const { interactions, xScale, xTicks, essence, dataset, stage } = props;

  const hasMultipleSeries = essence.series.count() > 1;
  const selectors = getChartsSelectors(essence, dataset);
  const chartStage = calculateChartStage(stage, selectors.length);
  return <React.Fragment>
    {hasMultipleSeries && <LegendSpot>
      <SeriesLegend essence={essence} />
    </LegendSpot>}
    {selectors.map(selector => {
      const key = nominalValueKey(selector(dataset), essence);
      return <SplitChart
        key={key}
        chartId={key}
        interactions={interactions}
        essence={essence}
        dataset={dataset}
        selectDatum={selector}
        xScale={xScale}
        xTicks={xTicks}
        visualisationStage={stage}
        chartStage={chartStage} />;
    })}
  </React.Fragment>;
};
