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
import {
  calculateBeeswarmPlottingStage,
  calculateBeeswarmXAxisStage,
  getExtent,
  getTicksForAvailableSpace
} from "./utils/get-scatterplot-data";

import { GridLines } from "../../components/grid-lines/grid-lines";
import { XAxis } from "./x-axis";

import * as d3 from "d3";
import { Dataset, Datum } from "plywood";
import { Essence } from "../../../common/models/essence/essence";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { Stage } from "../../../common/models/stage/stage";
import { selectFirstSplitDatums } from "../../utils/dataset/selectors/selectors";
import { LinearScale } from "../../utils/linear-scale/linear-scale";
import { Point } from "./point";
import { HoveredPoint } from "./scatterplot";
import { Tooltip } from "./tooltip";
import { dodge } from "./utils/dodge";

const TICK_SIZE = 10;
const TICK_COUNT = 10;

interface BeeswarmChartProps  extends ChartProps {
  hoveredPoint: HoveredPoint | null;
  setPointHover(point: HoveredPoint): void;
  resetPointHover(): void;
}

export class BeeswarmChart extends React.Component<BeeswarmChartProps, {}> {
  render() {
    const { data, essence, stage, setPointHover, resetPointHover, hoveredPoint } = this.props;
    const { plottingStage, scale, series, ticks, beeswarmData } = getBeeswarmData(data, essence, stage);
    const splitKey = essence.splits.splits.first().toKey();

    const points = getPoints({ data: beeswarmData, series, scale, pointRadius: 3, stage: plottingStage });

    return <div className="scatterplot-container" style={stage.getWidthHeight()}>
      <span className="axis-title axis-title-x" style={{ bottom: 150, right: 10 }}>{series.title()}</span>
      <Tooltip
        hoveredPoint={hoveredPoint}
        stage={plottingStage}
        xSeries={series}
        splitKey={splitKey}
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
          {points.map((datum, index) =>
            <Point key={index} datum={datum.data} x={datum.x} y={datum.y} r={datum.r} setHover={setPointHover} resetHover={resetPointHover}/>
          )}
        </g>
      </svg>
    </div>;
    }
  }

interface BeeswarmData {
  plottingStage: Stage;
  ticks: number[];
  scale: LinearScale;
  series: ConcreteSeries;
  beeswarmData: Datum[];
}

export function getBeeswarmData(data: Dataset, essence: Essence, stage: Stage): BeeswarmData  {
  const series = essence.getConcreteSeries().first();
  const beeswarmData = selectFirstSplitDatums(data);
  const extent = getExtent(beeswarmData, series);

  const plottingStage = calculateBeeswarmPlottingStage(stage);
  const scale = d3.scale.linear().domain(extent).nice().range([0, plottingStage.width]);

  const ticks = getTicksForAvailableSpace(scale.ticks(TICK_COUNT), plottingStage.width);

  return { plottingStage, scale, series, ticks, beeswarmData };
}

interface Point {
  r: number;
  x: number;
  y: number;
  data: Datum;
}

interface GetPoints {
  data: Datum[];
  series: ConcreteSeries;
  scale: LinearScale;
  pointRadius: number;
  stage: Stage;
}

export function getPoints({ data, series, scale, pointRadius, stage }: GetPoints): Point[] {
  const padding = 3;
  const yOffset = stage.height / 2;
  const yValues = dodge(data.map(i => scale(series.selectValue(i))), pointRadius * 2 + padding);

  return data.map((datum, index) => ({
    data: datum,
    r: pointRadius,
    x: scale(series.selectValue(datum)),
    y: yValues[index] + yOffset
  }));
}
