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

import React, { ComponentType } from "react";
import { Visualization } from "../../common/models/visualization-manifest/visualization-manifest";
import { DefaultVisualizationControls, VisualizationControlsBaseProps, VisualizationProps } from "../views/cube-view/center-panel/center-panel";
import { GridVisualizationControls } from "./grid/visualization-controls";

export const CHARTS: Record<Visualization, () => Promise<{ default: ComponentType<VisualizationProps> }>> = {
  "totals": () => import(/* webpackChunkName: "totals" */ "./totals/totals"),
  "table": () => import(/* webpackChunkName: "table" */ "./table/table"),
  "line-chart": () => import(/* webpackChunkName: "line-chart" */ "./line-chart/line-chart"),
  "bar-chart": () => import(/* webpackChunkName: "bar-chart" */ "./bar-chart/bar-chart"),
  "heatmap": () => import(/* webpackChunkName: "heatmap" */ "./heat-map/heat-map"),
  "grid": () => import(/* webpackChunkName: "grid" */ "./grid/grid"),
  "scatterplot": () => import(/* webpackChunkName: "scatterplot" */ "./scatterplot/scatterplot")
};

export const CONTROLS: Partial<Record<Visualization, ComponentType<VisualizationControlsBaseProps>>> = {
  grid: GridVisualizationControls
};

export function getVisualizationComponent(name: Visualization) {
  return function Visualization(props: VisualizationProps) {
    const Chart = getChartComponent(name);
    const Controls = CONTROLS[name] || DefaultVisualizationControls;
    return <>
      <Controls {...props} />
      <Chart {...props} />
    </>;
  };
}

export function getChartComponent(name: Visualization) {
  return function ChartComponent(props: VisualizationProps) {
    const Chart = React.lazy(CHARTS[name]);
    return <Chart {...props} />;
  };
}
