/*
 * Copyright 2017-2022 Allegro.pl
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
import { ScatterplotSettings } from "../../../common/visualization-manifests/scatterplot/settings";
import { Checkbox } from "../../components/checkbox/checkbox";
export const ScatterplotSettingsComponent: VisualizationSettingsComponent<ScatterplotSettings> = props => {
  const { settings, onChange } = props;
  const toggleSummary = () => onChange(settings.update("showSummary", showSummary => !showSummary));
  return <div className="settings-row">
    <Checkbox
      selected={settings.showSummary}
      label="Show heatmap summary"
      onClick={toggleSummary} />
  </div>;
};
