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

import "./scatterplot.scss";
import {Datum} from "plywood";
import {ConcreteSeries} from "../../../common/models/series/concrete-series";
import * as d3 from "d3";
import {selectFirstSplitDatums} from "../../utils/dataset/selectors/selectors";

import {LinearScale, pickTicks} from "../../utils/linear-scale/linear-scale";
import {Stage} from "../../../common/models/stage/stage";
import {VerticalAxis} from "../../components/vertical-axis/vertical-axis";

function getExtent(data: Datum[], series: ConcreteSeries): number[] {
  const selectValues = (d: Datum) => series.selectValue(d);
  return d3.extent(data, selectValues);
}

const Scatterplot: React.SFC<ChartProps> = ({data, essence, stage}) => {
  const [xSeries, ySeries] = essence.getConcreteSeries().toArray();
  const splitDatum = selectFirstSplitDatums(data)
  const yExtent = getExtent(splitDatum, ySeries)

  const xExtent = getExtent(splitDatum, xSeries)

  const xScale=d3.scale.linear().domain(xExtent).range([ 0, stage.width])
  const yAxisStage = calculateYAxisStage(stage)
  const yScale=d3.scale.linear().domain(yExtent).range([yAxisStage.height, 0])

  return <div className="scatterplot-container">
    <div style={yAxisStage.getWidthHeight()}>
    <h2>Scatterplot will be here</h2>

    <SingleYAxis series={ySeries} scale={yScale} stage={calculateYAxisStage(stage)} />
    </div>
  </div>;
};

export function ScatterplotVisualization(props: VisualizationProps) {
  return <React.Fragment>
    <DefaultVisualizationControls {...props} />
    <ChartPanel {...props} queryFactory={makeQuery} chartComponent={Scatterplot}/>
  </React.Fragment>;
}

export const TICK_LENGTH = 10;

interface SingleYAxisProps {
  series: ConcreteSeries;
  scale: LinearScale;
  stage: Stage;
}

// copies from bar chart

export const SingleYAxis: React.SFC<SingleYAxisProps> = props => {
  const { scale, series, stage } = props;
  return (<svg viewBox={stage.getViewBox()}>
      <g transform="translate(-1, 0)">
        <VerticalAxis
          stage={stage}
          ticks={pickTicks(scale, 10)}
          tickSize={TICK_LENGTH}
          scale={scale}
          formatter={series.formatter()} />
      </g>
    </svg>)
};



export function calculateYAxisStage(segmentStage: Stage): Stage {
  return Stage.fromJS({
    x: 10,
    y: 20,
    width: segmentStage.width-MARGIN,
    height: segmentStage.height -2*MARGIN
  });
}

const MARGIN = 50;
