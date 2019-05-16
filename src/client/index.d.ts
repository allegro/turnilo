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

declare module "@vx/*";

declare module "@vx/heatmap" {

  interface Bin {
    width: number;
    height: number;
    x: number;
    y: number;
    color: string;
    opacity: number;
    row: number;
    column: number;
  }

  export interface HeatmapRectProps {
    bins(rawDataPoint: any): any;
    count(rawDataPoint: any): number;
    data: any[];
    xScale: d3.scale.Linear<any, any>;
    yScale: d3.scale.Linear<any, any>;
    colorScale: d3.scale.Linear<any, any>;
    binWidth: number;
    binHeight: number;
    gap: number;
    children?: (heatmap: Bin[][]) => React.ReactNode;
  }
  export class HeatmapRect extends React.Component<HeatmapRectProps> {

  }
}

declare module "@vx/scale" {

  interface ScaleLinearOptions<Range, Output> {
    range: [Range, Range];
    domain: [number, number];
  }

  export const scaleLinear: <Range, Output = any>(options: ScaleLinearOptions<Range, Output>) => d3.scale.Linear<number, number>;
}

declare module "@vx/tooltip" {
  export interface TooltipProps<D> {
    tooltipOpen: boolean;
    tooltipLeft: number;
    tooltipTop: number;
    tooltipData: D;
    hideTooltip: () => void;
    showTooltip: (
      args: { tooltipLeft: number; tooltipTop: number; tooltipData: D }
    ) => void;
  }
  export const withTooltip: <P>(component: React.ComponentType<P & TooltipProps<any>>, options: any) => React.ComponentType<P>;

  interface TooltipWithBoundsProps {
    key: number | string;
    top: number;
    left: number;
    children: React.ReactNode;
  }
  const TooltipWithBounds: React.ComponentType<TooltipWithBoundsProps>;
}
