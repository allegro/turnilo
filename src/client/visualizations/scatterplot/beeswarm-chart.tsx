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

import { GridLines } from "../../components/grid-lines/grid-lines";
import { XAxis } from "./x-axis";

import { Point } from "./point";
import { HoveredPoint } from "./scatterplot";
import { Tooltip } from "./tooltip";
import { calculateBeeswarmXAxisStage, getBeeswarmData, getPoints } from "./utils/get-beeswarm-data";

const TICK_SIZE = 10;

interface BeeswarmChartProps  extends ChartProps {
  hoveredPoint: HoveredPoint | null;
  setPointHover(point: HoveredPoint): void;
  resetPointHover(): void;
}

export class BeeswarmChart extends React.Component<BeeswarmChartProps, {}> {
  render() {
    const { data, essence, stage, setPointHover, resetPointHover, hoveredPoint } = this.props;
    const { plottingStage, scale, series, ticks, beeswarmData } = getBeeswarmData(data, essence, stage);
    const mainSplit = essence.splits.splits.first();

    const lowerThreshold = Math.round(plottingStage.height * 0.1);
    const upperThreshold =  Math.round(plottingStage.height * 0.9);
    const topPointPosition = lowerThreshold / 2;
    const bottomPointPosition = plottingStage.height - topPointPosition;

    const points = getPoints({ data: beeswarmData, series, scale, pointRadius: 3, stage: plottingStage });

    const pointsAboveThreshold = points.map(point => point.y >= upperThreshold ? point : undefined).filter(Boolean); // high Y, lower on screen
    const pointsBelowThreshold = points.map(point => point.y <= lowerThreshold ? point : undefined).filter(Boolean);
    const pointsBetweenThresholds = points.map(point => (point.y > lowerThreshold && point.y < upperThreshold) ? point : undefined).filter(Boolean);

    return <div className="scatterplot-container" style={stage.getWidthHeight()}>
      <span className="axis-title axis-title-x" style={{ bottom: 150, right: 10 }}>{series.title()}</span>
      <Tooltip
        hoveredPoint={hoveredPoint}
        stage={plottingStage}
        xSeries={series}
        split={mainSplit}
        timezone={essence.timezone}
        showPrevious={essence.hasComparison()}/>
      <svg viewBox={stage.getViewBox()}>
        <GridLines orientation={"vertical"} stage={plottingStage} ticks={ticks} scale={scale}/>
        <XAxis
          scale={scale}
          stage={calculateBeeswarmXAxisStage(plottingStage)}
          ticks={ticks}
          formatter={series.formatter()}
          tickSize={TICK_SIZE}/>
        <g transform={plottingStage.getTransform()}>
          {pointsBetweenThresholds.map((datum, index) =>
            <Point key={`point-${mainSplit.selectValue(datum.data)}`} datum={datum.data} x={datum.x} y={datum.y} r={datum.r} setHover={setPointHover} resetHover={resetPointHover}/>
          )}
          <Point datum={pointsAboveThreshold[0].data} x={pointsAboveThreshold[0].x} y={bottomPointPosition} r={20} setHover={setPointHover} resetHover={resetPointHover} />
          <Point datum={pointsBelowThreshold[0].data} x={pointsBelowThreshold[0].x} y={topPointPosition} r={20} setHover={setPointHover} resetHover={resetPointHover} />
        </g>
      </svg>
    </div>;
    }
  }
