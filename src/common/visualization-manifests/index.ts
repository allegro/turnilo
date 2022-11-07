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

import { NamedArray } from "immutable-class";
import { VisualizationManifest } from "../models/visualization-manifest/visualization-manifest";
import { BAR_CHART_MANIFEST } from "./bar-chart/bar-chart";
import { GRID_MANIFEST } from "./grid/grid";
import { HEAT_MAP_MANIFEST } from "./heat-map/heat-map";
import { LINE_CHART_MANIFEST } from "./line-chart/line-chart";
import { SCATTERPLOT_MANIFEST } from "./scatterplot/scatterplot";
import { TABLE_MANIFEST } from "./table/table";
import { TOTALS_MANIFEST } from "./totals/totals";

export const MANIFESTS: VisualizationManifest[] = [
  TOTALS_MANIFEST,
  GRID_MANIFEST,
  LINE_CHART_MANIFEST as unknown as VisualizationManifest,
  BAR_CHART_MANIFEST,
  HEAT_MAP_MANIFEST,
  TABLE_MANIFEST as unknown as VisualizationManifest,
  SCATTERPLOT_MANIFEST as unknown as VisualizationManifest
];

export function manifestByName(visualizationName: string): VisualizationManifest {
  return NamedArray.findByName(MANIFESTS, visualizationName);
}
