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
import { NORMAL_COLORS } from "../../../../../common/models/colors/colors";
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
import { getContinuousSplit, getNominalSplit, hasNominalSplit } from "../../utils/splits";
import calculateExtend from "./extend";

interface SeriesChartProps {
  essence: Essence;
  dataset: Dataset;
  series: ConcreteSeries;
  xScale: ContinuousScale;
  xTicks: ContinuousTicks;
  chartStage: Stage;
}

export const SeriesChart: React.SFC<SeriesChartProps> = props => {
  const { chartStage, essence, series, xScale, xTicks, dataset } = props;

  const datum = dataset.data[0];
  // TODO: better name
  const continuousSplitDataset = datum[SPLIT] as Dataset;
  const hasComparison = essence.hasComparison();

  const label = <VisMeasureLabel
    series={series}
    datum={datum}
    showPrevious={hasComparison} />;

  const continuousSplit = getContinuousSplit(essence);
  const getX = (d: Datum) => d[continuousSplit.reference] as (TimeRange | NumberRange);
  const getY: Unary<Datum, number> = (d: Datum) => readNumber(series.selectValue(d));
  const getYP: Unary<Datum, number> = (d: Datum) => readNumber(series.selectValue(d, SeriesDerivation.PREVIOUS));

  const extent = calculateExtend(continuousSplitDataset, essence.splits, getY, getYP);

  if (hasNominalSplit(essence)) {
    const nominalSplit = getNominalSplit(essence);
    return <BaseChart
      label={label}
      xScale={xScale}
      xTicks={xTicks}
      chartStage={chartStage}
      formatter={series.formatter()}
      yDomain={extent}>
      {({ yScale, lineStage }) => <React.Fragment>
        {continuousSplitDataset.data.map((datum, index) => {
          const splitKey = datum[nominalSplit.reference];
          const color = NORMAL_COLORS[index];
          const dataset = (datum[SPLIT] as Dataset).data;
          return <React.Fragment key={String(splitKey)}>
            <ChartLine
              key={series.reactKey()}
              xScale={xScale}
              yScale={yScale}
              getX={getX}
              getY={getY}
              showArea={false}
              dashed={false}
              dataset={dataset}
              color={color}
              stage={lineStage} />
            {hasComparison && <ChartLine
              key={series.reactKey(SeriesDerivation.PREVIOUS)}
              xScale={xScale}
              yScale={yScale}
              getX={getX}
              getY={getYP}
              showArea={false}
              dashed={true}
              dataset={dataset}
              color={color}
              stage={lineStage} />}
          </React.Fragment>;
        })}
      </React.Fragment>}
    </BaseChart>;
  }

  return <BaseChart
    label={label}
    chartStage={chartStage}
    yDomain={extent}
    formatter={series.formatter()}
    xScale={xScale}
    xTicks={xTicks}>
    {({ yScale, lineStage }) => <React.Fragment>
      <ChartLine
        key={series.reactKey()}
        xScale={xScale}
        yScale={yScale}
        getX={getX}
        getY={getY}
        showArea={true}
        dashed={false}
        dataset={continuousSplitDataset.data}
        stage={lineStage} />
      {hasComparison && <ChartLine
        key={series.reactKey(SeriesDerivation.PREVIOUS)}
        xScale={xScale}
        yScale={yScale}
        getX={getX}
        getY={getYP}
        showArea={true}
        dashed={true}
        dataset={continuousSplitDataset.data}
        stage={lineStage} />}
    </React.Fragment>}
  </BaseChart>;
};
