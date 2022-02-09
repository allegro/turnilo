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
import { VerticalAxis } from "../../components/vertical-axis/vertical-axis";
import { roundToHalfPx } from "../../utils/dom/dom";
import { LinearScale, pickTicks } from "../../utils/linear-scale/linear-scale";

function getExtent(data: Datum[], series: ConcreteSeries): number[] {
  const selectValues = (d: Datum) => series.selectValue(d);
  return d3.extent(data, selectValues);
}

const Scatterplot: React.SFC<ChartProps> = ({ data, essence, stage }) => {
  const [xSeries, ySeries] = essence.getConcreteSeries().toArray();
  const splitDatum = selectFirstSplitDatums(data);
  const yExtent = getExtent(splitDatum, ySeries);

  const xExtent = getExtent(splitDatum, xSeries);

  const chartStage = calculateChartStage(stage);
  const yScale = d3.scale.linear().domain(yExtent).range([chartStage.height, 0]);
  const xScale = d3.scale.linear().domain(xExtent).range([0, chartStage.width]);
  const xTicks = pickTicks(xScale, 10);
  const yTicks = pickTicks(yScale, 10);

  // const xSeriesKey = xSeries.definition.key()
  // const ySeriesKey = ySeries.definition.key()

  return <div className="scatterplot-container">
    <div style={chartStage.getWidthHeight()}>
      <svg viewBox={chartStage.getViewBox()}>
        <GridLines orientation={"vertical"} stage={chartStage} ticks={xTicks} scale={xScale} />
        <GridLines orientation={"horizontal"} stage={chartStage} ticks={yTicks} scale={yScale} />
        <VerticalAxis
          stage={chartStage}
          ticks={yTicks}
          tickSize={TICK_SIZE}
          scale={yScale}
          formatter={ySeries.formatter()} />
        {/*{splitDatum.map((point, num) => {*/}
        {/*  const x = point[xSeriesKey] as number;*/}
        {/*  const y = point[ySeriesKey] as number;*/}
        {/*  return (*/}
        {/*    <circle*/}
        {/*      cx={roundToHalfPx(xScale(x))}*/}
        {/*      cy={roundToHalfPx(yScale(y) + chartStage.y)}*/}
        {/*      key={num} r={3}*/}
        {/*      stroke="blue"*/}
        {/*      fill={"red"}*/}
        {/*      transform="translate(-50%, -50%)"*/}
        {/*    />*/}
        {/*  );*/}
        {/*})}*/}
        <circle cx={roundToHalfPx(xScale(60))} cy={roundToHalfPx(yScale(10) + chartStage.y)} key={"hay"} r={3} stroke="blue" fill={"red"} transform="translate(-50%, -50%)"/>
      </svg>
      <XAxis scale={xScale} width={chartStage.width} ticks={xTicks}/>
    </div>
  </div>;
};

export function ScatterplotVisualization(props: VisualizationProps) {
  return <React.Fragment>
    <DefaultVisualizationControls {...props} />
    <ChartPanel {...props} queryFactory={makeQuery} chartComponent={Scatterplot}/>
  </React.Fragment>;
}

// copies from bar chart

export const TICK_SIZE = 10;

export function calculateChartStage(segmentStage: Stage): Stage {
  return Stage.fromJS({
    x: 0,
    y: 50,
    width: segmentStage.width - MARGIN,
    height: segmentStage.height - 2 * MARGIN
  });
}

const MARGIN = 50;

// copies from line chart

const TEXT_OFFSET = 12;
const X_AXIS_HEIGHT = 30;

export interface XAxisProps {
  width: number;
  ticks: Array<Date | number>;
  scale: LinearScale;
}
export const XAxis: React.SFC<XAxisProps> = props => {
  const { width, ticks, scale } = props;
  const stage = Stage.fromSize(width, X_AXIS_HEIGHT);

  const lines = ticks.map((tick: any) => {
    const x = roundToHalfPx(scale(tick));
    return <line key={String(tick)} x1={x} y1={0} x2={x} y2={TICK_SIZE} />;
  });

  const labelY = TICK_SIZE + TEXT_OFFSET;
  const labels = ticks.map((tick: any) => {
    const x = scale(tick);
    return <text key={String(tick)} x={x} y={labelY} style={{ textAnchor: "middle" }}>{tick}</text>;
  });

  return <svg viewBox={stage.getViewBox()}>
    <g stroke="gray" transform={stage.getTransform()}>
      {lines}
      {labels}
      <line y1={0} y2={0} x1={stage.x} x2={stage.width}/>
    </g>
  </svg>;
};
