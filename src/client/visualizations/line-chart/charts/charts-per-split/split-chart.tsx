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
import React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { defaultFormatter } from "../../../../../common/models/series/series-format";
import { Stage } from "../../../../../common/models/stage/stage";
import { Unary } from "../../../../../common/utils/functional/functional";
import { selectSplitDataset } from "../../../../utils/dataset/selectors/selectors";
import { useSettingsContext } from "../../../../views/cube-view/settings-context";
import { BaseChart } from "../../base-chart/base-chart";
import { ColoredSeriesChartLine } from "../../chart-line/colored-series-chart-line";
import { SingletonSeriesChartLine } from "../../chart-line/singleton-series-chart-line";
import { isHover } from "../../interactions/interaction";
import { InteractionsProps } from "../../interactions/interaction-controller";
import { ContinuousScale } from "../../utils/continuous-types";
import { extentAcrossSeries } from "../../utils/extent";
import { ContinuousTicks } from "../../utils/pick-x-axis-ticks";
import { getContinuousSplit } from "../../utils/splits";
import { Label } from "./label";
import { SplitHoverContent } from "./split-hover-content";

interface SplitChartProps {
  interactions: InteractionsProps;
  chartId: string;
  essence: Essence;
  dataset: Dataset;
  selectDatum: Unary<Dataset, Datum>;
  xScale: ContinuousScale;
  xTicks: ContinuousTicks;
  chartStage: Stage;
  visualisationStage: Stage;
}

export const SplitChart: React.FunctionComponent<SplitChartProps> = props => {
  const { customization: { visualizationColors } } = useSettingsContext();
  const {
    chartId,
    interactions,
    visualisationStage,
    chartStage,
    essence,
    xScale,
    xTicks,
    selectDatum,
    dataset
  } = props;
  const { interaction } = interactions;
  const splitDatum = selectDatum(dataset);
  const splitDataset = selectSplitDataset(splitDatum);

  const series = essence.getConcreteSeries();

  const label = <Label essence={essence} datum={splitDatum}/>;
  const hoverContent = isHover(interaction) && <SplitHoverContent
    interaction={interaction}
    essence={essence}
    dataset={splitDataset}/>;

  const continuousSplit = getContinuousSplit(essence);
  const getX = (d: Datum) => continuousSplit.selectValue<TimeRange | NumberRange>(d);
  const domain = extentAcrossSeries(splitDataset, essence);

  if (series.count() === 1) {
    const firstSeries = series.first();
    return <BaseChart
      chartId={chartId}
      interactions={interactions}
      hoverContent={hoverContent}
      timezone={essence.timezone}
      label={label}
      xScale={xScale}
      xTicks={xTicks}
      chartStage={chartStage}
      formatter={firstSeries.formatter()}
      yDomain={domain} visualisationStage={visualisationStage}>
      {({ yScale, lineStage }) => {
        return <SingletonSeriesChartLine
          xScale={xScale}
          yScale={yScale}
          getX={getX}
          dataset={splitDataset.data}
          stage={lineStage}
          essence={essence}
          series={firstSeries}/>;
      }}
    </BaseChart>;
  }

  return <BaseChart
    chartId={chartId}
    visualisationStage={visualisationStage}
    timezone={essence.timezone}
    hoverContent={hoverContent}
    interactions={interactions}
    label={label}
    xScale={xScale}
    xTicks={xTicks}
    chartStage={chartStage}
    formatter={defaultFormatter}
    yDomain={domain}>
    {({ yScale, lineStage }) => <React.Fragment>
      {series.toArray().map((series, index) => {
        const color = visualizationColors.series[index];
        return <ColoredSeriesChartLine
          key={series.plywoodKey()}
          xScale={xScale}
          yScale={yScale}
          getX={getX}
          dataset={splitDataset.data}
          stage={lineStage}
          essence={essence}
          series={series}
          color={color}/>;
      })}
    </React.Fragment>}
  </BaseChart>;
};
