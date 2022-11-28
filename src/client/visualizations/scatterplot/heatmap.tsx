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

import * as d3 from "d3";
import { Datum } from "plywood";
import React from "react";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { Stage } from "../../../common/models/stage/stage";
import { range } from "../../../common/utils/functional/functional";
import { ColorLegend } from "../../components/color-legend/color-legend";
import { LegendSpot } from "../../components/pinboard-panel/pinboard-panel";
import { LinearScale } from "../../utils/linear-scale/linear-scale";

interface HeatmapProps {
  xSeries: ConcreteSeries;
  ySeries: ConcreteSeries;
  xScale: LinearScale;
  yScale: LinearScale;
  xBinCount: number;
  yBinCount: number;
  data: Datum[];
  stage: Stage;
}

const COLOR_SCALE_START = "#fff";
const COLOR_SCALE_END = "#90b5d0";

export const Heatmap: React.FunctionComponent<HeatmapProps> = ({ xBinCount, yBinCount, xScale, yScale, stage, data, xSeries, ySeries }) => {
  const xQuantile = d3.scaleQuantile<number>().domain(xScale.domain()).range(range(0, xBinCount));
  const yQuantile = d3.scaleQuantile<number>().domain(yScale.domain()).range(range(0, yBinCount));

  const counts = getCounts({ xBinCount, yBinCount, data, xQuantile, xSeries, yQuantile, ySeries });

  const countExtent = [0, d3.max(counts, c => d3.max(c))];

  const colorScale = d3.scaleLinear<string>().domain(countExtent).range([COLOR_SCALE_START, COLOR_SCALE_END]);

  return <React.Fragment>
    <LegendSpot>
      <ColorLegend title="Count per summary bin" formatter={i => i.toString(10)} colorScale={colorScale} />
    </LegendSpot>
    <g transform={stage.getTransform()} className="heatmap">
      {counts.map((row, i) =>
        row.map((count, j) => (
          <Rectangle
            key={`key-${i}-${j}`}
            xScale={xScale}
            yScale={yScale}
            fillColor={colorScale(count)}
            xRange={xQuantile.invertExtent(i)}
            yRange={yQuantile.invertExtent(j)} />
        )))}
    </g>
  </React.Fragment>;
};

interface GetCounts {
  xBinCount: number;
  yBinCount: number;
  xSeries: ConcreteSeries;
  ySeries: ConcreteSeries;
  xQuantile: d3.ScaleQuantile<number>;
  yQuantile: d3.ScaleQuantile<number>;
  data: Datum[];
}

type Counts = number[][];

function getCounts({ xBinCount, yBinCount, xSeries, ySeries, xQuantile, yQuantile, data }: GetCounts): Counts {
  const counts = Array.from({ length: xBinCount }, () => Array.from({ length: yBinCount }, () => 0));

  data.forEach(datum => {
    const i = xQuantile(xSeries.selectValue(datum));
    const j = yQuantile(ySeries.selectValue(datum));
    counts[i][j] += 1;
  });

  return counts;
}

interface RectangleProps {
  xRange: [number, number];
  yRange: [number, number];
  xScale: LinearScale;
  yScale: LinearScale;
  fillColor: string;
}

const Rectangle: React.FunctionComponent<RectangleProps> = ({
  xRange,
  yRange,
  xScale,
  yScale,
  fillColor
}) => {
  const [x0, x1] = xRange;
  const [y0, y1] = yRange;
  const xPosition = xScale(x0);
  const width = xScale(x1) - xPosition;
  const yPosition = yScale(y1);
  const height = yScale(y0) - yPosition;

  return <rect
    fill={fillColor}
    x={xPosition}
    width={width}
    y={yPosition}
    height={height} />;
};
