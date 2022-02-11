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
import { Unary } from "../../../common/utils/functional/functional";
import { GridLines } from "../../components/grid-lines/grid-lines";
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

  const plottingStage = calculatePlottingStage(stage);
  const yScale = d3.scale.linear().domain(yExtent).nice().range([plottingStage.height, 0]);
  const xScale = d3.scale.linear().domain(xExtent).nice().range([0, plottingStage.width]);
  const xTicks = pickTicks(xScale, 10);
  const yTicks = pickTicks(yScale, 10);

  const xSeriesKey = xSeries.definition.key();
  const ySeriesKey = ySeries.definition.key();

  const ySeriesTitle = ySeries.title();
  const xSeriesTitle = xSeries.title();

  return <div className="scatterplot-container" style={stage.getWidthHeight()}>
    <span className="axisTitle" style={{ top: 10, left: 10 }}>{xSeriesTitle}</span>
    <span className="axisTitle" style={{ bottom: 145, right: 10 }}>{ySeriesTitle}</span>
      <svg viewBox={stage.getViewBox()}>
        <GridLines orientation={"vertical"} stage={plottingStage} ticks={xTicks} scale={xScale} />
        <GridLines orientation={"horizontal"} stage={plottingStage} ticks={yTicks} scale={yScale} />
        <XAxis scale={xScale} stage={calculateXAxisStage(plottingStage)} ticks={xTicks} formatter={xSeries.formatter()}/>
        <YAxis
          stage={calculateYAxisStage(plottingStage)}
          ticks={yTicks}
          tickSize={TICK_SIZE}
          scale={yScale}
          formatter={ySeries.formatter()} />
        {splitDatum.map((point, num) => {
          const x = point[xSeriesKey] as number;
          const y = point[ySeriesKey] as number;
          return (
            <circle
              cx={roundToHalfPx(xScale(x) + plottingStage.x)}
              cy={roundToHalfPx(yScale(y) + plottingStage.y)}
              key={num}
              r={3}
              className="point"
            />
          );
        })
        }
      </svg>
  </div>;
};

export function ScatterplotVisualization(props: VisualizationProps) {
  return <React.Fragment>
    <DefaultVisualizationControls {...props} />
    <ChartPanel {...props} queryFactory={makeQuery} chartComponent={Scatterplot}/>
  </React.Fragment>;
}

const TICK_SIZE = 10;
const MARGIN = 40;
const TEXT_OFFSET_X = 16;
const TEXT_OFFSET_Y = 4;
const X_AXIS_HEIGHT = 50;
const Y_AXIS_WIDTH = 50;

interface XAxisProps {
  stage: Stage;
  ticks: Array<Date | number>;
  scale: LinearScale;
  formatter: Unary<number, string>;
}

const XAxis: React.SFC<XAxisProps> = props => {
  const { stage, ticks, scale, formatter } = props;

  const lines = ticks.map((tick: any) => {
    const x = roundToHalfPx(scale(tick));
    return <line className="tick" key={String(tick)} x1={x} y1={0} x2={x} y2={TICK_SIZE} />;
  });

  const labelY = TICK_SIZE + TEXT_OFFSET_X;
  const linePositionY = roundToHalfPx(0);
  const labels = ticks.map((tick: any) => {
    const x = scale(tick);
    return <text className="label xAxisLabel" key={String(tick)} x={x} y={labelY}>{formatter(tick)}</text>;
  });

  return (<g className="axis" transform={stage.getTransform()}>
      {lines}
      {labels}
      <line className="border" y1={linePositionY} y2={linePositionY} x1={0} x2={stage.width}/>
    </g>);
};

interface YAxisProps {
  stage: Stage;
  ticks: number[];
  tickSize: number;
  scale: any;
  formatter: Unary<number, string>;
  topLineExtend?: number;
  hideZero?: boolean;
}

const YAxis: React.SFC<YAxisProps> = ({ formatter, stage, tickSize, ticks: inputTicks, scale, topLineExtend = 0, hideZero }) => {
  const ticks = hideZero ? inputTicks.filter((tick: number) => tick !== 0) : inputTicks;

  const lines = ticks.map((tick: any) => {
    const y = roundToHalfPx(scale(tick));
    return <line className="tick" key={String(tick)} x1={Y_AXIS_WIDTH - tickSize} y1={y} x2={Y_AXIS_WIDTH} y2={y} />;
  });

  const linePositionX = roundToHalfPx(Y_AXIS_WIDTH);

  const labels = ticks.map((tick: any) => {
    const y = scale(tick);
    const labelX = y + TEXT_OFFSET_Y;
    return <text className="label" key={String(tick)} x={0} y={labelX}>{formatter(tick)}</text>;
  });

  return <g className="axis" transform={stage.getTransform()}>
    <line className="border" x1={linePositionX} y1={-topLineExtend} x2={linePositionX} y2={stage.height} />
    {lines}
    {labels}
  </g>;
};

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
