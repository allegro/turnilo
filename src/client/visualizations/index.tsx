/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { find } from 'plywood';
import { Manifest } from '../../common/models/manifest/manifest';
import { BaseVisualization } from './base-visualization/base-visualization';

import { Totals } from './totals/totals';
import { Table } from './table/table';
import { LineChart } from './line-chart/line-chart';
import { BarChart } from './bar-chart/bar-chart';
import { Geo } from './geo/geo';

const VIS_COMPONENTS: Array<typeof BaseVisualization> = [
  Totals,
  Table,
  LineChart,
  BarChart,
  Geo
];

export function getVisualizationComponent(manifest: Manifest): typeof BaseVisualization {
  var manifestName = manifest.name;
  return find(VIS_COMPONENTS, (v) => (v as any).id === manifestName);
}
