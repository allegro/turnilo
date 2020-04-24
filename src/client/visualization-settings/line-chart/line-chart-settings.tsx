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
import { VisualizationSettingsComponent } from "../../../common/models/visualization-settings/visualization-settings";
import { ChartsPer, LineChartSettings } from "../../../common/visualization-manifests/line-chart/settings";
import { Dropdown } from "../../components/dropdown/dropdown";

function renderChartsPer(chartsPer: ChartsPer): string {
  switch (chartsPer) {
    case ChartsPer.SPLIT:
      return "split";
    case ChartsPer.SERIES:
      return "series";
  }
}

export const LineChartSettingsComponent: VisualizationSettingsComponent<LineChartSettings> = ({ settings, onChange }) => {
  const saveChartsPer = (value: ChartsPer) => onChange(settings.set("chartsPer", value));
  return <div className="settings-row">
    <span className="settings-label">Chart per:</span>
    <Dropdown<ChartsPer>
      items={[ChartsPer.SPLIT, ChartsPer.SERIES]}
      onSelect={saveChartsPer}
      selectedItem={settings.chartsPer}
      renderItem={renderChartsPer}
    />
  </div>;
};
