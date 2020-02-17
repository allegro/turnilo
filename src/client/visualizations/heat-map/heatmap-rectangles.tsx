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

import { HeatmapRect } from "@vx/heatmap";
import { scaleLinear } from "@vx/scale";
import { max, min } from "d3";
import { Dataset, Datum } from "plywood";
import * as React from "react";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { noop } from "../../../common/utils/functional/functional";
import { GlobalEventListener } from "../../components/global-event-listener/global-event-listener";
import { SPLIT } from "../../config/constants";
import { HeatMapRectangleRow } from "./heatmap-rectangle-row";

const white = "#fff";
const orange = "#ff5a00";

const bins = (d: Datum) => (d[SPLIT] as Dataset).data;

export interface RectangleData {
  xLabel: string;
  yLabel: string;
  datum: Datum;
  x: number;
  y: number;
  column: number;
  row: number;
}

interface HeatMapRectanglesProps {
  dataset: Datum[];
  tileSize?: number;
  series: ConcreteSeries;
  leftLabelName: string;
  topLabelName: string;
  hoveredRectangle?: RectangleData;
  onHover?: (data: RectangleData) => void;
  onHoverStop?: () => void;
}

export class HeatMapRectangles extends React.Component<HeatMapRectanglesProps> {
  private rect: HTMLDivElement | null = null;

  handleMouseMove = (event: MouseEvent) => {
    const { clientX: x, clientY: y } = event;
    const {
      onHoverStop = noop,
      onHover = noop,
      leftLabelName,
      topLabelName,
      dataset
    } = this.props;

    const {
      xScale,
      yScale
    } = this.setup();

    if (!this.rect) {
      return;
    }
    const { top, bottom, left, right } = this.rect.getBoundingClientRect();

    if ((y < top || y > bottom) || (x < left || x > right)) {
      onHoverStop();
      return;
    }

    const xPosition = Math.floor(xScale.invert(x - left));
    const yPosition = Math.floor(yScale.invert(y - top));

    const hoveredBins = dataset[yPosition];
    if (!hoveredBins) {
      return;
    }

    const hoveredBin = bins(hoveredBins)[xPosition];
    if (!hoveredBin) {
      return;
    }

    onHover({
      datum: hoveredBin,
      xLabel: hoveredBins[leftLabelName] as string,
      yLabel: hoveredBin[topLabelName] as string,
      x,
      y,
      column: yPosition,
      row: xPosition
    });
  };

  private setup() {
    const { tileSize = 25, dataset, series, hoveredRectangle } = this.props;
    const count = (d: Datum) => series.selectValue(d);

    const colorMin = min(dataset, d => min(bins(d), count));
    const colorMax = max(dataset, d => max(bins(d), count));
    const bucketSizeMax = max(dataset, d => bins(d).length);
    const dataLength = dataset.length;

    const width = bucketSizeMax * tileSize;
    const height = dataLength * tileSize;

    const xScale = scaleLinear({
      domain: [0, bucketSizeMax],
      range: [0, width]
    });

    const yScale = scaleLinear({
      domain: [dataLength, 0],
      range: [height, 0]
    });

    const rectColorScale = scaleLinear({
      range: [white, orange],
      domain: [Math.min(colorMin, 0), colorMax]
    });

    return {
      width,
      height,
      count,
      dataset,
      xScale,
      yScale,
      rectColorScale,
      tileSize,
      hoveredRectangle
    };
  }

  render() {
    const {
      width,
      height,
      count,
      dataset,
      xScale,
      yScale,
      rectColorScale,
      tileSize,
      hoveredRectangle
    } = this.setup();

    return (
      <div className="heatmap-rectangles-container">
        <svg width={width} height={height} ref={rect => this.rect = rect as any}>
          <rect x={0} y={0} width={width} height={height} fill={white} />
          <HeatmapRect
            bins={bins}
            count={count}
            data={dataset}
            xScale={xScale}
            yScale={yScale}
            colorScale={rectColorScale}
            binWidth={tileSize}
            binHeight={tileSize}
            gap={2}
          >
            {heatmap => heatmap.map((bins, index) => (
                <HeatMapRectangleRow
                  key={`heatmap-rect-row-${bins[0].column}`}
                  bins={bins}
                  hoveredBin={(hoveredRectangle && hoveredRectangle.column === index) ? hoveredRectangle.row : -1}
                />
              )
            )
            }
          </HeatmapRect>
        </svg>
        <GlobalEventListener mouseMove={this.handleMouseMove} />
      </div>
    );
  }
}
