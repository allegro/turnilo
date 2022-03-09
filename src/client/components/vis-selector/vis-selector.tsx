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
import { Clicker } from "../../../common/models/clicker/clicker";
import { Essence } from "../../../common/models/essence/essence";
import { Stage } from "../../../common/models/stage/stage";
import { VisualizationManifest } from "../../../common/models/visualization-manifest/visualization-manifest";
import { VisualizationSettings } from "../../../common/models/visualization-settings/visualization-settings";
import { classNames } from "../../utils/dom/dom";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { VisSelectorItem } from "./vis-selector-item";
import { VisSelectorMenu } from "./vis-selector-menu";
import "./vis-selector.scss";

export interface VisSelectorProps {
  clicker: Clicker;
  essence: Essence;
}

export interface VisSelectorState {
  openMenu: boolean;
}

const visSelectorMenuStage = Stage.fromSize(268, 176);

export class VisSelector extends React.Component<VisSelectorProps, VisSelectorState> {

  private selector = React.createRef<HTMLDivElement>();

  state: VisSelectorState = { openMenu: false };

  openMenu = (e: React.MouseEvent<HTMLElement>) => {
    const { openMenu } = this.state;
    const target = e.currentTarget;
    if (openMenu && this.selector.current === target) {
      this.closeMenu();
      return;
    }
    this.setState({
      openMenu: true
    });
  };

  closeMenu = () => this.setState({ openMenu: false });

  changeVisualization = (vis: VisualizationManifest, settings: VisualizationSettings) => this.props.clicker.changeVisualization(vis, settings);

  renderMenu() {
    const { openMenu } = this.state;

    if (!openMenu) return null;
    const { essence } = this.props;
    return <BubbleMenu
      className="vis-selector-menu-container"
      direction="down"
      stage={visSelectorMenuStage}
      openOn={this.selector.current}
      onClose={this.closeMenu}
    >
      <VisSelectorMenu
        initialVisualization={essence.visualization}
        initialSettings={essence.visualizationSettings}
        onClose={this.closeMenu}
        onSelect={this.changeVisualization} />
    </BubbleMenu>;
  }

  render() {
    const { essence: { visualization } } = this.props;
    const { openMenu } = this.state;

    return <React.Fragment>
      <div
        ref={this.selector}
        className={classNames("vis-selector", { active: openMenu })}
        onClick={this.openMenu}>
        <VisSelectorItem visualization={visualization} selected={true} />
      </div>
      {this.renderMenu()}
    </React.Fragment>;
  }
}
