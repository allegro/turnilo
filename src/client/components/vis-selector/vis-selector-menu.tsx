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

import React from "react";
import { VisualizationManifest } from "../../../common/models/visualization-manifest/visualization-manifest";
import { VisualizationSettings } from "../../../common/models/visualization-settings/visualization-settings";
import { Binary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { ImmutableRecord } from "../../../common/utils/immutable-utils/immutable-utils";
import { MANIFESTS } from "../../../common/visualization-manifests";
import { LineChartSettings } from "../../../common/visualization-manifests/line-chart/settings";
import { ScatterplotSettings } from "../../../common/visualization-manifests/scatterplot/settings";
import { TableSettings } from "../../../common/visualization-manifests/table/settings";
import { STRINGS } from "../../config/constants";
import { settingsComponent } from "../../visualization-settings/settings-component";
import { Button } from "../button/button";
import { VisSelectorItem } from "./vis-selector-item";
import "./vis-selector-menu.scss";

export interface VisSelectorMenuProps {
  onSelect: Binary<VisualizationManifest, VisualizationSettings, void>;
  initialVisualization: VisualizationManifest;
  initialSettings: VisualizationSettings;
  onClose: Fn;
}

interface VisSelectorMenuState {
  visualization: VisualizationManifest;
  visualizationSettings: VisualizationSettings;
}

export class VisSelectorMenu extends React.Component<VisSelectorMenuProps, VisSelectorMenuState> {

  state: VisSelectorMenuState = {
    visualization: this.props.initialVisualization,
    visualizationSettings: this.props.initialSettings
  };

  save = () => {
    const { onSelect, onClose } = this.props;
    const { visualization, visualizationSettings } = this.state;
    onSelect(visualization, visualizationSettings);
    onClose();
  };

  close = () => this.props.onClose();

  changeVisualization = (visualization: VisualizationManifest) => this.setState({ visualization, visualizationSettings: visualization.visualizationSettings.defaults });
  changeSettings = (visualizationSettings: VisualizationSettings) => this.setState({ visualizationSettings });

  renderSettings() {
    const component = this.settingsComponent();
    if (!component) return null;
    return <div className="vis-settings">
      <div className="vis-settings-title">Settings</div>
      {component}
    </div>;
  }

  settingsComponent(): JSX.Element | null {
    const { visualization, visualizationSettings } = this.state;
    /*
      TODO:
      Right now visualization and settings do not share type parameter.
      We need to:
        * move them together into union type indexed by visualization.name
        * create getters for manifest in essence
        * use switch to unpack both fields at once
        * create mapped type acting like Visualization -> VisualizationSettings<Visualization>
     */
    switch (visualization.name) {
      case "table":
        const TableSettingsComponent = settingsComponent(visualization.name);
        return <TableSettingsComponent onChange={this.changeSettings as Unary<ImmutableRecord<TableSettings>, void>}
                                       settings={visualizationSettings as ImmutableRecord<TableSettings>} />;
      case "grid":
        return null;
      case "heatmap":
        return null;
      case "totals":
        return null;
      case "bar-chart":
        return null;
      case "line-chart":
        const LineChartSettingsComponent = settingsComponent(visualization.name);
        return <LineChartSettingsComponent onChange={this.changeSettings as Unary<ImmutableRecord<LineChartSettings>, void>}
                                           settings={visualizationSettings as ImmutableRecord<LineChartSettings>}/>;
      case "scatterplot":
        const ScatterplotSettingsComponent = settingsComponent(visualization.name);
        return <ScatterplotSettingsComponent onChange={this.changeSettings as Unary<ImmutableRecord<ScatterplotSettings>, void>}
                                             settings={visualizationSettings as ImmutableRecord<ScatterplotSettings>} />;
    }
  }

  render() {
    const { visualization: selected } = this.state;

    return <div className="vis-selector-menu">
      <div className="vis-items">
        {MANIFESTS.map(visualization => <VisSelectorItem
          key={visualization.name}
          visualization={visualization}
          selected={visualization.name === selected.name}
          onClick={this.changeVisualization} />)}
      </div>
      {this.renderSettings()}
      <div className="ok-cancel-bar">
        <Button type="primary" title={STRINGS.ok} onClick={this.save} />
        <Button type="secondary" title={STRINGS.cancel} onClick={this.close} />
      </div>
    </div>;
  }
}
