/*
 * Copyright 2017-2021 Allegro.pl
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
import * as React from "react";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { Stage } from "../../../common/models/stage/stage";
import { range } from "../../../common/utils/functional/functional";
import { LinearScale } from "../../utils/linear-scale/linear-scale";

/**
 * TODO:
 *   Settings for heatmap visibility
 *   Legend component (fix in heatmap viz also)
 *   "Secondary" color for rect fill
 */

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

type Counts = number[][];

// function getCounts({ data, xSeries, ySeries, xScale, yScale }: HeatmapProps): Counts {
//
//   return counts;
// }

const white = "#fff";
const orange = "#ff5a00";

export const Heatmap: React.SFC<HeatmapProps> = props => {
  const { xBinCount, yBinCount, data, xSeries, ySeries, xScale, yScale, stage } = props;

  const xQuantile = d3.scale.quantile<number>().domain(xScale.domain()).range(range(0, xBinCount));
  const yQuantile = d3.scale.quantile<number>().domain(yScale.domain()).range(range(0, yBinCount));

  let counts: Counts = Array.from({ length: xBinCount }).map(_ => Array.from({ length: yBinCount }).map(_ => 0));

  data.forEach(datum => {
    const i = xQuantile(xSeries.selectValue(datum));
    const j = yQuantile(ySeries.selectValue(datum));
    counts[i][j] += 1;
  });

  const countExtent = [0, d3.max(counts, c => d3.max(c))];

  const colorScale = d3.scale.linear<string>().domain(countExtent).range([white, orange]);

  return <g transform={stage.getTransform()}>
    {counts.map((row, i) =>
      row.map((count, j) => {
        const [x0, x1] = xQuantile.invertExtent(i);
        const [y0, y1] = yQuantile.invertExtent(j);
        const x = xScale(x0);
        const width = xScale(x1) - x;
        const y = yScale(y1);
        const height = yScale(y0) - yScale(y1);
        return <rect key={`key-${i}-${j}`}
                     fill={colorScale(count)}
                     fillOpacity={0.5}
                     x={x}
                     width={width}
                     y={y}
                     height={height}>
        </rect>;
    }))}
  </g>;
};
