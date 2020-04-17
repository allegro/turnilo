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

import { Dataset, Datum, NumberRange, TimeRange } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { ConcreteSeries, SeriesDerivation } from "../../../../../common/models/series/concrete-series";
import { Stage } from "../../../../../common/models/stage/stage";
import { Unary } from "../../../../../common/utils/functional/functional";
import { readNumber } from "../../../../../common/utils/general/general";
import { VisMeasureLabel } from "../../../../components/vis-measure-label/vis-measure-label";
import { SPLIT } from "../../../../config/constants";
import { BaseChart } from "../../base-chart/base-chart";
import { ChartLine } from "../../chart-line/chart-line";
import { ContinuousTicks } from "../../utils/pick-x-axis-ticks";
import { ContinuousScale } from "../../utils/scale";
import { getContinuousDimension, hasNominalSplit } from "../../utils/splits";
import calculateExtend from "./extend";

interface SeriesChart {
  essence: Essence;
  dataset: Dataset;
  series: ConcreteSeries;
  xScale: ContinuousScale;
  xTicks: ContinuousTicks;
  chartStage: Stage;
}

export const SeriesChart: React.SFC<SeriesChart> = props => {
  const { chartStage, essence, series, xScale, xTicks, dataset } = props;

  if (hasNominalSplit(essence)) {
    throw new Error("Only single split");
  }

  const hasComparison = essence.hasComparison();

  const continuousDimension = getContinuousDimension(essence);
  const getX = (d: Datum) => d[continuousDimension.name] as (TimeRange | NumberRange);
  const getY: Unary<Datum, number> = (d: Datum) => readNumber(series.selectValue(d));
  const getYP: Unary<Datum, number> = (d: Datum) => readNumber(series.selectValue(d, SeriesDerivation.PREVIOUS));

  const datum = dataset.data[0];
  const timeSeries = datum[SPLIT] as Dataset;

  const extent = calculateExtend(timeSeries, essence.splits, getY, getYP);

  const label = <VisMeasureLabel
    series={series}
    datum={datum}
    showPrevious={hasComparison} />;

  return <BaseChart
    label={label}
    chartStage={chartStage}
    yDomain={extent}
    formatter={series.formatter()}
    xScale={xScale}
    xTicks={xTicks}>
    {({ yScale, lineStage }) => <React.Fragment>
      <ChartLine
        xScale={xScale}
        yScale={yScale}
        getX={getX}
        getY={getY}
        showArea={true}
        dashed={false}
        dataset={timeSeries}
        stage={lineStage} />
      {hasComparison && <ChartLine
        xScale={xScale}
        yScale={yScale}
        getX={getX}
        getY={getYP}
        showArea={true}
        dashed={true}
        dataset={timeSeries}
        stage={lineStage} />}
    </React.Fragment>}
  </BaseChart>;
};
