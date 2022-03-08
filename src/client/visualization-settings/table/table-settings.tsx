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

import React from "react";
import { VisualizationSettingsComponent } from "../../../common/models/visualization-settings/visualization-settings";
import { TableSettings } from "../../../common/visualization-manifests/table/settings";
import { Checkbox } from "../../components/checkbox/checkbox";

export const TableSettingsComponent: VisualizationSettingsComponent<TableSettings> = ({ settings, onChange }) => {
  const toggleCollapseRows = () => onChange(settings.update("collapseRows", collapse => !collapse));
  return <div className="settings-row">
    <Checkbox
      selected={settings.collapseRows}
      label="Collapse rows"
      onClick={toggleCollapseRows} />
  </div>;
};
