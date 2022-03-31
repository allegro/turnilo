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

import { Visualization } from "../../common/models/visualization-manifest/visualization-manifest";
import { VisualizationProps } from "../views/cube-view/center-panel/center-panel";

const VISUALIZATIONS  = {
  "totals": () => import(/* webpackChunkName: "totals" */ "./totals/totals"),
  "table": () => import(/* webpackChunkName: "table" */ "./table/table"),
  "line-chart": () => import(/* webpackChunkName: "line-chart" */ "./line-chart/line-chart"),
  "bar-chart": () => import(/* webpackChunkName: "bar-chart" */ "./bar-chart/bar-chart"),
  "heatmap": () => import(/* webpackChunkName: "heatmap" */ "./heat-map/heat-map"),
  "grid": () => import(/* webpackChunkName: "grid" */ "./grid/grid"),
  "scatterplot": () => import(/* webpackChunkName: "scatterplot" */ "./scatterplot/scatterplot")
};

export function getVisualizationComponent(name: Visualization): () => Promise<{
  default: React.ComponentType<VisualizationProps>;
}> {
  return VISUALIZATIONS[name];
}
