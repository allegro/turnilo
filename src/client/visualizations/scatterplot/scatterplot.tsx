/*
 * Copyright 2017-2022 Allegro.pl
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
import * as React from "react";

import { ChartProps } from "../../../common/models/chart-props/chart-props";
import makeQuery from "../../../common/utils/query/visualization-query";
import {
  ChartPanel,
  DefaultVisualizationControls,
  VisualizationProps
} from "../../views/cube-view/center-panel/center-panel";

import * as d3 from "d3";
import { Datum } from "plywood";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { selectFirstSplitDatums } from "../../utils/dataset/selectors/selectors";
import "./scatterplot.scss";

import { Stage } from "../../../common/models/stage/stage";
import { GridLines } from "../../components/grid-lines/grid-lines";
import { pickTicks } from "../../utils/linear-scale/linear-scale";
import { Point } from "./point";
import { XAxis } from "./x-axis";
import { YAxis } from "./y-axis";

const TICK_SIZE = 10;
const MARGIN = 40;
const X_AXIS_HEIGHT = 50;
export const Y_AXIS_WIDTH = 50;

const Scatterplot: React.SFC<ChartProps> = ({ data, essence, stage }) => {
  const [xSeries, ySeries] = essence.getConcreteSeries().toArray();
  const scatterplotData = selectFirstSplitDatums(data);
  const xExtent = getExtent(scatterplotData, xSeries);
  const yExtent = getExtent(scatterplotData, ySeries);

  const plottingStage = calculatePlottingStage(stage);
  const yScale = d3.scale.linear().domain(yExtent).nice().range([plottingStage.height, 0]);
  const xScale = d3.scale.linear().domain(xExtent).nice().range([0, plottingStage.width]);
  const xTicks = pickTicks(xScale, 10);
  const yTicks = pickTicks(yScale, 10);

  return <div className="scatterplot-container" style={stage.getWidthHeight()}>
    <span className="axis-title" style={{ top: 10, left: 10 }}>{xSeries.title()}</span>
    <span className="axis-title" style={{ bottom: 145, right: 10 }}>{ySeries.title()}</span>
    <svg viewBox={stage.getViewBox()}>
      <GridLines orientation={"vertical"} stage={plottingStage} ticks={xTicks} scale={xScale} />
      <GridLines orientation={"horizontal"} stage={plottingStage} ticks={yTicks} scale={yScale} />
      <XAxis scale={xScale} stage={calculateXAxisStage(plottingStage)} ticks={xTicks} formatter={xSeries.formatter()} tickSize={TICK_SIZE}/>
      <YAxis
        stage={calculateYAxisStage(plottingStage)}
        ticks={yTicks}
        tickSize={TICK_SIZE}
        scale={yScale}
        formatter={ySeries.formatter()} />
      <g transform={plottingStage.getTransform()}>
        {scatterplotData.map(datum => (
          <Point datum={datum} xScale={xScale} yScale={yScale} xSeries={xSeries} ySeries={ySeries} key={`point-${datum.x}-${datum.y}`}/>
        ))}
      </g>
    </svg>
  </div>;
};

export function ScatterplotVisualization(props: VisualizationProps) {
  return <React.Fragment>
    <DefaultVisualizationControls {...props} />
    <ChartPanel {...props} queryFactory={makeQuery} chartComponent={Scatterplot}/>
  </React.Fragment>;
}

function getExtent(data: Datum[], series: ConcreteSeries): number[] {
  const selectValues = (d: Datum) => series.selectValue(d);
  return d3.extent(data, selectValues);
}

function calculatePlottingStage(stage: Stage): Stage {
  return Stage.fromJS({
    x: Y_AXIS_WIDTH + MARGIN,
    y: MARGIN,
    width: stage.width - Y_AXIS_WIDTH - 2 * MARGIN,
    height: stage.height - X_AXIS_HEIGHT - 2 * MARGIN
  });
}

function calculateXAxisStage(stage: Stage): Stage {
  return Stage.fromJS({
    x: Y_AXIS_WIDTH + MARGIN,
    y: stage.height + MARGIN,
    width: stage.width,
    height: X_AXIS_HEIGHT
  });
}

function calculateYAxisStage(stage: Stage): Stage {
  return Stage.fromJS({
    x: MARGIN,
    y: MARGIN,
    width: Y_AXIS_WIDTH,
    height: stage.height
  });
}
