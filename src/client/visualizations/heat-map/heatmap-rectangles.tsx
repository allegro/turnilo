/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import { genBins } from '@vx/mock-data';
import { scaleLinear } from '@vx/scale';
import { HeatmapRect } from '@vx/heatmap';

const cool1 = '#fff';
const cool2 = '#ff5900';
const bg = '#fff';

const data = genBins(16, 16);

// utils
const max = (data: any, value = (d: any) => d) => Math.max(...data.map(value));
const min = (data: any, value = (d: any) => d) => Math.min(...data.map(value));

// accessors
const bins = (d: any) => d.bins;
const count = (d: any) => d.count;

export class HeatMapRectangles extends React.Component {

  render() {
    const margin = {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    };
    const width = 500;
    const height = 500;

    let size = width;
    if (size > margin.left + margin.right) {
      size = width - margin.left - margin.right;
    }

    const colorMax = max(data, d => max(bins(d), count));
    const bucketSizeMax = max(data, d => bins(d).length);

    // scales
    const xScale = scaleLinear({
      domain: [0, data.length]
    });
    const yScale = scaleLinear({
      domain: [0, bucketSizeMax]
    });

    const rectColorScale = scaleLinear({
      range: [cool1, cool2],
      domain: [0, colorMax]
    });
  
    const xMax = size;
    const yMax = height - margin.bottom - margin.top;
  
    const binWidth = xMax / data.length;
    xScale.range([0, xMax]);
    yScale.range([yMax - binWidth, -binWidth]);
  
    return (
      <div>
        <svg width={width} height={height}>
          <rect x={0} y={0} width={width} height={height} fill={bg} />
            <HeatmapRect
              data={data}
              xScale={xScale}
              yScale={yScale}
              colorScale={rectColorScale}
              binWidth={binWidth}
              binHeight={binWidth}
              gap={2}
            >
              {(heatmap: any) => {
                return heatmap.map((bins: any) => {
                  return bins.map((bin: any) => {
                    return (
                      <rect
                        key={`heatmap-rect-${bin.row}-${bin.column}`}
                        className="vx-heatmap-rect"
                        width={bin.width}
                        height={bin.height}
                        x={bin.x}
                        y={bin.y}
                        fill={bin.color}
                        fillOpacity={bin.opacity}
                        onClick={event => {
                          const { row, column } = bin;
                          alert(JSON.stringify({ row, column, ...bin.bin }));
                        }}
                      />
                    );
                  });
                });
              }}
            </HeatmapRect>
        </svg>
      </div>
    );
  }
}
