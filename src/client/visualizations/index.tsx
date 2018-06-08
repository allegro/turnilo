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

import { SimpleArray } from "immutable-class";
import { Manifest } from "../../common/models/manifest/manifest";

import { BarChart } from "./bar-chart/bar-chart";
import { BaseVisualization } from "./base-visualization/base-visualization";
import { LineChart } from "./line-chart/line-chart";
import { Table } from "./table/table";
import { Totals } from "./totals/totals";

// TODO, back to: const VIS_COMPONENTS: Array<typeof BaseVisualization> = [
const VIS_COMPONENTS: any[] = [
  Totals,
  Table,
  LineChart,
  BarChart
];

export function getVisualizationComponent(manifest: Manifest): typeof BaseVisualization {
  var manifestName = manifest.name;
  return SimpleArray.find(VIS_COMPONENTS, v => (v as any).id === manifestName);
}
