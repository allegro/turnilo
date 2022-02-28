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
import { Datum } from "plywood";
import * as React from "react";

import { ChartProps } from "../../../common/models/chart-props/chart-props";
import makeQuery from "../../../common/utils/query/visualization-query";
import {
  ChartPanel,
  DefaultVisualizationControls,
  VisualizationProps
} from "../../views/cube-view/center-panel/center-panel";

import "./scatterplot.scss";

import memoizeOne from "memoize-one";
import { ScatterplotSettings } from "../../../common/visualization-manifests/scatterplot/settings";
import { GridLines } from "../../components/grid-lines/grid-lines";
import { Heatmap } from "./heatmap";
import { Point } from "./point";
import { Tooltip } from "./tooltip";
import {
  calculateXAxisStage,
  calculateYAxisStage,
  getTicksForAvailableSpace, getXAxisLabelPosition,
  preparePlottingData
} from "./utils/get-plotting-data";
import { XAxis } from "./x-axis";
import { YAxis } from "./y-axis";

const TICK_SIZE = 10;

interface ScatterplotState {
  hoveredPoint: Datum | null;
}

export class Scatterplot extends React.Component<ChartProps, ScatterplotState> {
  state: ScatterplotState = {
    hoveredPoint: null
  };

  getPlottingData = memoizeOne(preparePlottingData);

  setPointHover = (datum: Datum): void =>
    this.setState({ hoveredPoint: datum });

  resetPointHover = (): void =>
    this.setState({ hoveredPoint: null });

  render() {
    const { data, essence, stage } = this.props;
    const splitKey = essence.splits.splits.first().toKey();
    const showHeatmap = (essence.visualizationSettings as ScatterplotSettings).showSummary;

    const {
      xTicks,
      yTicks,
      xScale,
      yScale,
      xSeries,
      ySeries,
      plottingStage,
      scatterplotData
    } = this.getPlottingData(data, essence, stage);

    const xAxisLabelPosition = getXAxisLabelPosition(stage, plottingStage);

    return <div className="scatterplot-container" style={stage.getWidthHeight()}>
      <span className="axis-title axis-title-y" style={{ top: 10, left: 10 }}>{ySeries.title()}</span>
      <span className="axis-title axis-title-x" style={{ bottom: xAxisLabelPosition.bottom, right: xAxisLabelPosition.right }}>{xSeries.title()}</span>
      <Tooltip
        datum={this.state.hoveredPoint}
        stage={plottingStage}
        ySeries={ySeries}
        xSeries={xSeries}
        yScale={yScale}
        xScale={xScale}
        splitKey={splitKey}
        timezone={essence.timezone}
        showPrevious={essence.hasComparison()}/>
      <svg viewBox={stage.getViewBox()}>
        {showHeatmap && <Heatmap
          stage={plottingStage}
          data={scatterplotData}
          xBinCount={xTicks.length - 1}
          yBinCount={yTicks.length - 1}
          xScale={xScale}
          xSeries={xSeries}
          yScale={yScale}
          ySeries={ySeries}/>}
        <GridLines orientation={"vertical"} stage={plottingStage} ticks={xTicks} scale={xScale}/>
        <GridLines orientation={"horizontal"} stage={plottingStage} ticks={yTicks} scale={yScale}/>
        <XAxis
          scale={xScale}
          stage={calculateXAxisStage(plottingStage)}
          ticks={getTicksForAvailableSpace(xTicks, plottingStage.width)}
          formatter={xSeries.formatter()}
          tickSize={TICK_SIZE}/>
        <YAxis
          stage={calculateYAxisStage(plottingStage)}
          ticks={getTicksForAvailableSpace(yTicks, plottingStage.height)}
          tickSize={TICK_SIZE}
          scale={yScale}
          formatter={ySeries.formatter()}/>
        <g transform={plottingStage.getTransform()}>
          {scatterplotData.map(datum => {
            return (
              <Point
                key={`point-${datum[splitKey]}`}
                datum={datum}
                xScale={xScale}
                yScale={yScale}
                xSeries={xSeries}
                ySeries={ySeries}
                setHover={this.setPointHover}
                resetHover={this.resetPointHover}/>
            );
          })}
        </g>
      </svg>
    </div>;
  }
}

export function ScatterplotVisualization(props: VisualizationProps) {
  return <React.Fragment>
    <DefaultVisualizationControls {...props} />
    <ChartPanel {...props} queryFactory={makeQuery} chartComponent={Scatterplot}/>
  </React.Fragment>;
}
