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
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { Stage } from "../../../../../common/models/stage/stage";
import { VisMeasureLabel } from "../../../../components/vis-measure-label/vis-measure-label";
import { selectFirstSplitDataset, selectMainDatum, selectSplitDatums } from "../../../../utils/dataset/selectors/selectors";
import { useSettingsContext } from "../../../../views/cube-view/settings-context";
import { BaseChart } from "../../base-chart/base-chart";
import { ColoredSeriesChartLine } from "../../chart-line/colored-series-chart-line";
import { SingletonSeriesChartLine } from "../../chart-line/singleton-series-chart-line";
import { isHover } from "../../interactions/interaction";
import { InteractionsProps } from "../../interactions/interaction-controller";
import { ContinuousScale } from "../../utils/continuous-types";
import { extentAcrossSplits } from "../../utils/extent";
import { ContinuousTicks } from "../../utils/pick-x-axis-ticks";
import { getContinuousSplit, getNominalSplit, hasNominalSplit } from "../../utils/splits";
import { SeriesHoverContent } from "./series-hover-content";

interface SeriesChartProps {
  chartId: string;
  interactions: InteractionsProps;
  essence: Essence;
  dataset: Dataset;
  series: ConcreteSeries;
  xScale: ContinuousScale;
  xTicks: ContinuousTicks;
  chartStage: Stage;
  visualisationStage: Stage;
}

export const SeriesChart: React.FunctionComponent<SeriesChartProps> = props => {
  const { customization: { visualizationColors } } = useSettingsContext();
  const { chartId, interactions, visualisationStage, chartStage, essence, series, xScale, xTicks, dataset } = props;
  const hasComparison = essence.hasComparison();
  const continuousSplitDataset = selectFirstSplitDataset(dataset);
  const { interaction } = interactions;

  const hoverContent = isHover(interaction) && <SeriesHoverContent
    essence={essence}
    dataset={continuousSplitDataset}
    range={interaction.range}
    series={series}/>;

  const label = <VisMeasureLabel
    series={series}
    datum={selectMainDatum(dataset)}
    showPrevious={hasComparison} />;

  const continuousSplit = getContinuousSplit(essence);
  const getX = (d: Datum) => continuousSplit.selectValue<TimeRange | NumberRange>(d);

  const domain = extentAcrossSplits(continuousSplitDataset, essence, series);

  if (hasNominalSplit(essence)) {
    const nominalSplit = getNominalSplit(essence);
    return <BaseChart
      visualisationStage={visualisationStage}
      chartId={chartId}
      interactions={interactions}
      hoverContent={hoverContent}
      timezone={essence.timezone}
      label={label}
      xScale={xScale}
      xTicks={xTicks}
      chartStage={chartStage}
      formatter={series.formatter()}
      yDomain={domain}>
      {({ yScale, lineStage }) => <React.Fragment>
        {continuousSplitDataset.data.map((datum, index) => {
          const splitKey = nominalSplit.selectValue(datum);
          const color = visualizationColors.series[index];
          return <ColoredSeriesChartLine
            key={String(splitKey)}
            xScale={xScale}
            yScale={yScale}
            getX={getX}
            color={color}
            dataset={selectSplitDatums(datum)}
            stage={lineStage}
            essence={essence}
            series={series} />;
        })}
      </React.Fragment>}
    </BaseChart>;
  }
  return <BaseChart
    chartId={series.plywoodKey()}
    visualisationStage={visualisationStage}
    interactions={interactions}
    hoverContent={hoverContent}
    timezone={essence.timezone}
    label={label}
    chartStage={chartStage}
    yDomain={domain}
    formatter={series.formatter()}
    xScale={xScale}
    xTicks={xTicks}>
    {({ yScale, lineStage }) => <SingletonSeriesChartLine
      xScale={xScale}
      yScale={yScale}
      getX={getX}
      dataset={continuousSplitDataset.data}
      stage={lineStage}
      essence={essence}
      series={series} />}
  </BaseChart>;
};
