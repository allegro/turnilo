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
import { scaleLinear, scaleLog } from '@vx/scale';
import { HeatmapRect } from '@vx/heatmap';
import { Dataset, Datum } from "plywood";
import { SPLIT } from "../../config/constants";

const white = '#fff';
const orange = '#ff5a00';

// utils
const max = (data: any, value = (d: any) => d) => Math.max(...data.map(value));

// accessors
const bins = (d: Datum) => (d[SPLIT] as Dataset).data;

interface Props {
  data: Dataset;
  tileSize?: number;
  measureName: string;
}

export class HeatMapRectangles extends React.Component<Props> {

  render() {
    const { tileSize = 25, data: dataset, measureName } = this.props;
    const datapoints = (dataset.data[0][SPLIT] as Dataset).data;
    const count = (d: Datum) => d[measureName];

    const colorMax = max(datapoints, d => max(bins(d), count));
    const bucketSizeMax = max(datapoints, d => bins(d).length);
    const dataLength = datapoints.length;

    const width = bucketSizeMax * tileSize;
    const height = dataLength * tileSize;

    // scales
    const xScale = scaleLinear({
      domain: [0, bucketSizeMax]
    });
    xScale.range([0, width]);

    const yScale = scaleLinear({
      domain: [dataLength, 0]
    });
    yScale.range([height, 0]);

    const rectColorScale = scaleLinear({
      range: [white, orange],
      domain: [0, colorMax]
    });

    return (
      <div>
        <svg width={width} height={height}>
          <rect x={0} y={0} width={width} height={height} fill={white} />
            <HeatmapRect
              bins={bins}
              count={count}
              data={datapoints}
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
                        x={bin.y}
                        y={bin.x}
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
