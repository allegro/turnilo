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

import { Dataset, Datum, PlywoodValue } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { Stage } from "../../../../../common/models/stage/stage";
import { compose } from "../../../../../common/utils/functional/functional";
import { SPLIT } from "../../../../config/constants";
import { ContinuousTicks } from "../../utils/pick-x-axis-ticks";
import { ContinuousScale } from "../../utils/scale";
import { getNominalSplit, hasNominalSplit } from "../../utils/splits";
import { calculateChartStage } from "../calculate-chart-stage";
import { SplitChart } from "./split-chart";

interface ChartsPerSplit {
  essence: Essence;
  dataset: Dataset;
  xScale: ContinuousScale;
  xTicks: ContinuousTicks;
  stage: Stage;
}

export const ChartsPerSplit: React.SFC<ChartsPerSplit> = props => {
  const { xScale, xTicks, essence, dataset, stage } = props;

  const get1stLevel = (dataset: Dataset) => dataset.data[0];

  if (!hasNominalSplit(essence)) {
    const chartStage = calculateChartStage(stage, 1);
    return <SplitChart
      essence={essence}
      dataset={dataset}
      selectDatum={get1stLevel}
      xScale={xScale}
      xTicks={xTicks}
      chartStage={chartStage} />;
  }

  const nominalSplit = getNominalSplit(essence);
  const splitDatums = (get1stLevel(dataset)[SPLIT] as Dataset).data;
  const chartStage = calculateChartStage(stage, splitDatums.length);

  return <React.Fragment>
    {splitDatums.map((datum, index) => {
      const get2ndLevel = (datum: Datum) => (datum[SPLIT] as Dataset).data[index];
      const getSubDataset = compose<Dataset, Datum, Datum>(get1stLevel, get2ndLevel);
      const key = datum[nominalSplit.reference] as PlywoodValue;
      return <SplitChart
        key={String(key)}
        essence={essence}
        selectDatum={getSubDataset}
        chartStage={chartStage}
        xScale={xScale}
        xTicks={xTicks}
        dataset={dataset} />;
    })}
  </React.Fragment>;
};
