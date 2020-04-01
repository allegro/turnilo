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
import { Essence } from "../../../common/models/essence/essence";
import "./heatmap-corner.scss";
import { HeatmapLegend } from "./heatmap-legend";
import { ColorScale } from "./utils/scales";

interface HeatmapCornerProps {
  essence: Essence;
  width: number;
  height: number;
  colorScale: ColorScale;
}

const labelMargin = 20;
const labelOffset = 40;
// Around half of font-size with handpicked offset to accommodate rounding errors and rotation artifacts
const rotationAxisOffset = 7;

export const HeatmapCorner: React.SFC<HeatmapCornerProps> = ({ colorScale, width, height, essence }) => {
  const { dataCube, splits: { splits } } = essence;

  const row = splits.get(0);
  const column = splits.get(1);
  const rowTitle = row.getTitle(dataCube.getDimension(row.reference));
  const columnTitle = column.getTitle(dataCube.getDimension(column.reference));
  const series = essence.getConcreteSeries().first();

  const legendHeight = height - labelOffset;
  const legendWidth = width - labelOffset;

  return <div className="heatmap-corner">
    <HeatmapLegend
      scale={colorScale}
      height={legendHeight}
      width={legendWidth}
      series={series} />
    <div className="heatmap-corner-row-title">
      <span className="heatmap-corner-overflow-label"
            style={{ width: `${width - labelMargin}px` }}>
        {rowTitle}
      </span>
    </div>
    <div className="heatmap-corner-column-title"
         style={{ left: `${width - labelMargin + rotationAxisOffset}px` }}>
      <span className="heatmap-corner-overflow-label"
            style={{ width: `${height - labelMargin}px` }}>
        {columnTitle}
      </span>
    </div>
  </div>;
};
