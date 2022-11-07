/*
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

declare module "@vx/*";

declare module "@vx/heatmap" {

  import { ColorScale, LinearScale } from "./visualizations/heat-map/utils/scales";

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
    xScale: LinearScale;
    yScale: LinearScale;
    colorScale: ColorScale;
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

  export const scaleLinear: <Range = number, Output = number>(options: ScaleLinearOptions<Range, Output>) => d3.ScaleLinear<Range, Output>;
}

declare module "@vx/tooltip" {
  interface TooltipWithBoundsProps {
    key: number | string;
    top: number;
    left: number;
    children: React.ReactNode;
  }
  const TooltipWithBounds: React.ComponentType<TooltipWithBoundsProps>;
}

declare module "react-syntax-highlighter/src/light" {
  export { default } from "react-syntax-highlighter/dist/esm/light";
}

declare module "react-syntax-highlighter/src/styles/hljs/github-gist" {
  export { default } from "react-syntax-highlighter/dist/esm/styles/hljs/github-gist";
}
