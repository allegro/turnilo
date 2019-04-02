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

const white = '#fff';
const orange = '#ff5900';

const data = genBins(16, 16);

// utils
const max = (data: any, value = (d: any) => d) => Math.max(...data.map(value));

// accessors
const bins = (d: any) => d.bins;
const count = (d: any) => d.count;

interface Props {
  tileSize?: number;
}

export class HeatMapRectangles extends React.Component<Props> {

  render() {
    const { tileSize = 50 } = this.props;

    const colorMax = max(data, d => max(bins(d), count));
    const bucketSizeMax = max(data, d => bins(d).length);

    const width = data.length * tileSize;
    const height = bucketSizeMax * tileSize;

    // scales
    const xScale = scaleLinear({
      domain: [0, data.length]
    });
    const yScale = scaleLinear({
      domain: [0, bucketSizeMax]
    });

    const rectColorScale = scaleLinear({
      range: [white, orange],
      domain: [0, colorMax]
    });

    xScale.range([0, width]);
    yScale.range([height - tileSize, -tileSize]);

    return (
      <div>
        <svg width={width} height={height}>
          <rect x={0} y={0} width={width} height={height} fill={white} />
            <HeatmapRect
              data={data}
              xScale={xScale}
              yScale={yScale}
              colorScale={rectColorScale}
              binWidth={tileSize}
              binHeight={tileSize}
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
