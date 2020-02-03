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

import { Visualization, VisualizationManifest } from "../../common/models/visualization-manifest/visualization-manifest";
import { VisualizationProps } from "../../common/models/visualization-props/visualization-props";
import { BarChart } from "./bar-chart/bar-chart";
import { BaseVisualization, BaseVisualizationState } from "./base-visualization/base-visualization";
import { HeatMap } from "./heat-map/heat-map";
import { LineChart } from "./line-chart/line-chart";
import { Table } from "./table/table";
import { Totals } from "./totals/totals";

type VisualizationComponent<S extends BaseVisualizationState = BaseVisualizationState> = new(props: VisualizationProps) => BaseVisualization<S>;

const VIS_COMPONENTS: Record<Visualization, VisualizationComponent> = {
  "totals": Totals,
  "table": Table,
  "line-chart": LineChart,
  "bar-chart": BarChart,
  "heatmap": HeatMap
};

export function getVisualizationComponent({ name }: VisualizationManifest): VisualizationComponent {
  return VIS_COMPONENTS[name];
}
