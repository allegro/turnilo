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
  calculatePlottingStage,
  calculateXAxisStage,
  getExtent,
  getTicksForAvailableSpace
} from "./utils/get-plotting-data";

import { GridLines } from "../../components/grid-lines/grid-lines";
import { XAxis } from "./x-axis";

import * as d3 from "d3";
import { selectFirstSplitDatums } from "../../utils/dataset/selectors/selectors";
import { dodge } from "./utils/dodge";

const TICK_SIZE = 10;
const TICK_COUNT = 10;

export class BeeswarmChart extends React.Component<ChartProps, {}> {
  render() {
    const { data, essence, stage } = this.props;
    const series = essence.getConcreteSeries().first();
    const beeswarmData = selectFirstSplitDatums(data);
    const extent = getExtent(beeswarmData, series);

    const plottingStage = calculatePlottingStage(stage);
    const scale = d3.scale.linear().domain(extent).nice().range([0, plottingStage.width]);

    const xTicks = scale.ticks(TICK_COUNT);

    const radius = 3;
    const padding = 3;
    const yValues = dodge(beeswarmData.map(i => scale(series.selectValue(i))), radius * 2 + padding);

    const yOffset = plottingStage.height / 2;

    return <div className="scatterplot-container" style={stage.getWidthHeight()}>
      <span className="axis-title axis-title-x" style={{ bottom: 150, right: 10 }}>{series.title()}</span>
      <svg viewBox={stage.getViewBox()}>
        <GridLines orientation={"vertical"} stage={plottingStage} ticks={xTicks} scale={scale}/>
        <XAxis
          scale={scale}
          stage={calculateXAxisStage(plottingStage)}
          ticks={getTicksForAvailableSpace(xTicks, plottingStage.width)}
          formatter={series.formatter()}
          tickSize={TICK_SIZE}/>
        <g transform={plottingStage.getTransform()}>
          {beeswarmData.map((datum, index) =>
            <circle
              key={index}
              cx={scale(series.selectValue(datum))}
              cy={yValues[index] + yOffset}
              r={3}
              className="point"
          />)}
        </g>
      </svg>
    </div>;
    }
  }
