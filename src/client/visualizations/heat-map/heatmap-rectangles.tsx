/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { HeatmapRect } from "@visx/heatmap";
import { Dataset, Datum } from "plywood";
import React from "react";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { SPLIT } from "../../config/constants";
import { equalProps } from "../../utils/equal-props/equal-props";
import { LinearScale } from "../../utils/linear-scale/linear-scale";
import { HeatMapRectangleRow } from "./heatmap-rectangle-row";
import "./heatmap-rectangles.scss";
import { ColorScale } from "./utils/scales";

export interface HeatMapRectanglesProps {
  dataset: Datum[];
  series: ConcreteSeries;
  colorScale: ColorScale;
  xScale: LinearScale;
  yScale: LinearScale;
  tileSize: number;
  gap: number;
  leftLabelName: string;
  topLabelName: string;
}

const bins = (d: Datum) => (d[SPLIT] as Dataset).data;

export class HeatMapRectangles extends React.Component<HeatMapRectanglesProps> {

  shouldComponentUpdate(nextProps: Readonly<HeatMapRectanglesProps>): boolean {
    return !equalProps(this.props, nextProps);
  }

  render() {
    const { series, colorScale, xScale, yScale, gap, tileSize, dataset } = this.props;

    const [height] = yScale.range();
    const [, width] = xScale.range();

    return (
      <div className="heatmap-rectangles-container">
        <svg width={width} height={height}>
          <rect x={0} y={0} width={width} height={height} fill="#fff" />
          <HeatmapRect
            bins={bins}
            count={d => series.selectValue(d)}
            data={dataset}
            xScale={xScale}
            yScale={yScale}
            colorScale={colorScale}
            binWidth={tileSize}
            binHeight={tileSize}
            gap={gap}
          >
            {heatmap => heatmap.map(bins => (
              <HeatMapRectangleRow
                key={`heatmap-rect-row-${bins[0].column}`}
                bins={bins} />
            ))}
          </HeatmapRect>
        </svg>
      </div>
    );
  }
}
