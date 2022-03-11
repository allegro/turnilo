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
import React from "react";
import { Unary } from "../../../common/utils/functional/functional";
import "./color-legend.scss";

interface ColorLegendProps {
  width?: number;
  height?: number;
  title: string;
  formatter: Unary<number, string>;
  colorScale: d3.ScaleLinear<string, string>;
}

const leftMargin = 5;
const topMargin = 10;
const bottomMargin = 5;
const tickLabelTopOffset = 4;
const tickLabelLeftOffset = 7;
const tickLength = 5;
const stripeWidth = 30;
const stripeHeight = 200;
const panelWidth = 100;

export const ColorLegend: React.FunctionComponent<ColorLegendProps> = ({ title, width = panelWidth, height = stripeHeight, formatter, colorScale }) => {
  const [min, max] = colorScale.domain();
  if (isNaN(min) || isNaN(max)) return null;

  const stripeLength = height - topMargin - bottomMargin;
  const [startColor, endColor] = colorScale.range();

  return <div className="color-legend">
    <div className="color-legend-header">
      {title}
    </div>
    <div className="color-legend-stripe">
      <svg
        className="color-legend"
        width={`${width}px`}
        height={`${height}px`}>
        <defs>
          <linearGradient id="color-stripe" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor={endColor}/>
            <stop offset="10%" stopColor={endColor}/>
            <stop offset="90%" stopColor={startColor}/>
            <stop offset="100%" stopColor={startColor}/>
          </linearGradient>
        </defs>
        <g transform={`translate(${leftMargin}, ${topMargin})`}>
          <rect className="color-legend-stripe"
            x={0}
            y={0}
            width={stripeWidth}
            height={stripeLength}
            fill="url(#color-stripe)"/>
          <line className="color-legend-stripe-axis"
            x1={0.5}
            x2={0.5}
            y1={0}
            y2={stripeLength}/>
          <g className="color-upper-bound">
            <line className="color-upper-bound-tick"
              x1={0}
              x2={tickLength + stripeWidth}
              y1={0.5}
              y2={0.5}/>
            <text className="color-upper-bound-value"
              x={tickLabelLeftOffset + stripeWidth}
              y={tickLabelTopOffset}>
              {formatter(max)}
            </text>
          </g>
          <g className="color-lower-bound">
            <line className="color-lower-bound-tick"
              x1={0}
              x2={tickLength + stripeWidth}
              y1={stripeLength + 0.5}
              y2={stripeLength + 0.5}/>
            <text className="color-lower-bound-value"
              x={tickLabelLeftOffset + stripeWidth}
              y={stripeLength + tickLabelTopOffset}>
              {formatter(min)}
            </text>
          </g>
        </g>
      </svg>
    </div>
  </div>;
};
