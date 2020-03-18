/*
 * Copyright 2017-2018 Allegro.pl
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
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import "./heatmap-legend.scss";
import { ColorScale } from "./utils/scales";

interface HeatmapLegendProps {
  scale: ColorScale;
  series: ConcreteSeries;
  height: number;
  width: number;
}

const leftMargin = 5;
const topMargin = 10;
const bottomMargin = 5;
const tickLength = 15;
const tickLabelTopOffset = 4;
const tickLabelLeftOffset = 17;
const stripeWidth = 10;

export const HeatmapLegend: React.SFC<HeatmapLegendProps> = ({ width, height, series, scale }) => {
  const [min, max] = scale.domain();
  if (isNaN(min) || isNaN(max)) return null;

  const stripeLength = height - topMargin - bottomMargin;
  const [startColor, endColor] = scale.range();
  const format = series.formatter();

  return <svg
    className="heatmap-legend"
    width={`${width}px`}
    height={`${height}px`}>
    <defs>
      <linearGradient id="heatmap-stripe" gradientTransform="rotate(90)">
        <stop offset="0%" stopColor={startColor} />
        <stop offset="10%" stopColor={startColor} />
        <stop offset="90%" stopColor={endColor} />
        <stop offset="100%" stopColor={endColor} />
      </linearGradient>
    </defs>
    <g transform={`translate(${leftMargin}, ${topMargin})`}>
      <rect className="heatmap-legend-stripe"
            x={0}
            y={0}
            width={stripeWidth}
            height={stripeLength}
            fill="url(#heatmap-stripe)" />
      <line className="heatmap-legend-stripe-axis"
            x1={0.5}
            x2={0.5}
            y1={0}
            y2={stripeLength} />
      <g className="heatmap-lower-bound">
        <line className="heatmap-lower-bound-tick"
              x1={0}
              x2={tickLength}
              y1={0.5}
              y2={0.5} />
        <text className="heatmap-lower-bound-value"
              x={tickLabelLeftOffset}
              y={tickLabelTopOffset}>
          {format(min)}
        </text>
      </g>
      <g className="heatmap-upper-bound">
        <line className="heatmap-upper-bound-tick"
              x1={0}
              x2={tickLength}
              y1={stripeLength + 0.5}
              y2={stripeLength + 0.5} />
        <text className="heatmap-upper-bound-value"
              x={tickLabelLeftOffset}
              y={stripeLength + tickLabelTopOffset}>
          {format(max)}
        </text>
      </g>
    </g>
  </svg>;
};
