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
}

export const HeatmapLegend: React.SFC<HeatmapLegendProps> = ({ height, series, scale }) => {
  const [min, max] = scale.domain();
  if (isNaN(min) || isNaN(max)) return null;

  const [startColor, endColor] = scale.range();

  const format = series.formatter();
  const [y1, y2] = [10, height - 10];

  return <svg className="heatmap-legend" width="100px" height="100px">
    <defs>
      <linearGradient id="heatmap-stripe" gradientTransform="rotate(90)">
        <stop offset="0%" stop-color={startColor} />
        <stop offset="10%" stop-color={startColor} />
        <stop offset="90%" stop-color={endColor} />
        <stop offset="100%" stop-color={endColor} />
      </linearGradient>
    </defs>
    <rect className="heatmap-legend-stripe" x={5} y={y1} width={10} height={y2 - y1} fill="url(#heatmap-stripe)" />
    <line x1={5.5} x2={5.5} y1={y1} y2={y2} className="heatmap-legend-stripe-axis"/>
    <g className="heatmap-lower-bound">
      <line x1={5} x2={20} y1={y1 + 0.5} y2={y1 + 0.5} className="heatmap-lower-bound-tick"/>
      <text x={22} y={y1 + 4} className="heatmap-lower-bound-value">{format(min)}</text>
    </g>
    <g className="heatmap-upper-bound">
      <line x1={5} x2={20} y1={y2 + 0.5} y2={y2 + 0.5} className="heatmap-upper-bound-tick"/>
      <text x={22} y={y2 + 4} className="heatmap-upper-bound-value">{format(max)}</text>
    </g>
  </svg>;
};
