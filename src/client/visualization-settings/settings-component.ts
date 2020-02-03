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

import { Visualization } from "../../common/models/visualization-manifest/visualization-manifest";
import { VisualizationSettingsComponent } from "../../common/models/visualization-settings/visualization-settings";
import { EmptySettingsComponent } from "./empty-settings-component";
import { TableSettingsComponent } from "./table/table-settings";

const Components: Record<Visualization, VisualizationSettingsComponent<unknown>> = {
  "bar-chart": EmptySettingsComponent,
  "line-chart": EmptySettingsComponent,
  "heatmap": EmptySettingsComponent,
  "totals": EmptySettingsComponent,
  "table": TableSettingsComponent
};

export function settingsComponent(visualization: Visualization): VisualizationSettingsComponent<unknown> {
  return Components[visualization];
}
