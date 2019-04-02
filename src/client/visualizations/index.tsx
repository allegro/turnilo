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

import { BAR_CHART_MANIFEST } from "../../common/manifests/bar-chart/bar-chart";
import { LINE_CHART_MANIFEST } from "../../common/manifests/line-chart/line-chart";
import { TABLE_MANIFEST } from "../../common/manifests/table/table";
import { TOTALS_MANIFEST } from "../../common/manifests/totals/totals";
import { HEAT_MAP_MANIFEST } from "../../common/manifests/heat-map/heat-map";
import { Manifest } from "../../common/models/manifest/manifest";
import { VisualizationProps } from "../../common/models/visualization-props/visualization-props";
import { BarChart } from "./bar-chart/bar-chart";
import { BaseVisualization, BaseVisualizationState } from "./base-visualization/base-visualization";
import { LineChart } from "./line-chart/line-chart";
import { Table } from "./table/table";
import { Totals } from "./totals/totals";
import { HeatMap } from "./heat-map/heat-map";

type Visualisation = new(props: VisualizationProps) => BaseVisualization<BaseVisualizationState>;

const VIS_COMPONENTS: Record<string, Visualisation> = {
  [TOTALS_MANIFEST.name]: Totals,
  [TABLE_MANIFEST.name]: Table,
  [LINE_CHART_MANIFEST.name]: LineChart,
  [BAR_CHART_MANIFEST.name]: BarChart,
  [HEAT_MAP_MANIFEST.name]: HeatMap
};

export function getVisualizationComponent({ name }: Manifest): Visualisation {
  return VIS_COMPONENTS[name];
}
