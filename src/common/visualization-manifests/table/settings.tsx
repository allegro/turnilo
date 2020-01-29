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

import * as React from "react";
import { Checkbox } from "../../../client/components/checkbox/checkbox";
import { VisualizationSettings, VisualizationSettingsComponent } from "../../models/visualization-settings/visualization-settings";

export interface TableSettings {
  collapseRows: boolean;
}

const TableSettingsComponent: VisualizationSettingsComponent<TableSettings> = ({ collapseRows, onChange }) =>
  <div>
    <Checkbox
      selected={collapseRows}
      onClick={() => onChange({ collapseRows: !!collapseRows })}>
      Collapse rows
    </Checkbox>
  </div>;

export const settings: VisualizationSettings<TableSettings> = {
  component: TableSettingsComponent,
  converter: {
    print: (settings: TableSettings) => settings,
    read: (input: TableSettings) => ({ collapseRows: !!input.collapseRows })
  },
  defaults: {
    collapseRows: false
  }
};
