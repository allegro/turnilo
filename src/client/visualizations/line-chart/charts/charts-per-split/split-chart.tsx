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
import { SeriesDerivation } from "../../../../../common/models/series/concrete-series";
import { defaultFormatter } from "../../../../../common/models/series/series-format";
import { Stage } from "../../../../../common/models/stage/stage";
import { Unary } from "../../../../../common/utils/functional/functional";
import { readNumber } from "../../../../../common/utils/general/general";
import { SPLIT } from "../../../../config/constants";
import { BaseChart } from "../../base-chart/base-chart";
import { ChartLine } from "../../chart-line/chart-line";
import { ContinuousTicks } from "../../utils/pick-x-axis-ticks";
import { ContinuousScale } from "../../utils/scale";
import { getContinuousSplit } from "../../utils/splits";
import calculateExtend from "./calculate-extend";
import { Label } from "./label";

interface SplitChartProps {
  essence: Essence;
  dataset: Dataset;
  selectDatum: Unary<Dataset, Datum>;
  xScale: ContinuousScale;
  xTicks: ContinuousTicks;
  chartStage: Stage;
}

export const SplitChart: React.SFC<SplitChartProps> = props => {
  const { chartStage, essence, xScale, xTicks, selectDatum, dataset } = props;
  const splitDatum = selectDatum(dataset);
  const splitDataset = splitDatum[SPLIT] as Dataset;

  const hasComparison = essence.hasComparison();
  const series = essence.getConcreteSeries().toArray();

  const continuousSplit = getContinuousSplit(essence);
  const getX = (d: Datum) => d[continuousSplit.reference] as (TimeRange | NumberRange);
  const domain = calculateExtend(splitDataset, essence);

  return <BaseChart
    label={<Label essence={essence} datum={splitDatum} />}
    xScale={xScale}
    xTicks={xTicks}
    chartStage={chartStage}
    formatter={defaultFormatter}
    yDomain={domain}>
    {({ yScale, lineStage }) => <React.Fragment>
      {series.map((series, index) => {
        const color = NORMAL_COLORS[index];
        const getY: Unary<Datum, number> = (d: Datum) => readNumber(series.selectValue(d));
        const getYP: Unary<Datum, number> = (d: Datum) => readNumber(series.selectValue(d, SeriesDerivation.PREVIOUS));
        return <React.Fragment key={series.reactKey()}>
          <ChartLine
            key={series.reactKey()}
            xScale={xScale}
            yScale={yScale}
            getX={getX}
            getY={getY}
            showArea={false}
            dashed={false}
            dataset={splitDataset.data}
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
            dataset={splitDataset.data}
            color={color}
            stage={lineStage} />}
        </React.Fragment>;
      })}
    </React.Fragment>}
  </BaseChart>;
};
