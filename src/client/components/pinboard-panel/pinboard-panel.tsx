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

import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import { createTeleporter } from "../../utils/teleporter/teleporter";
import "./pinboard-panel.scss";
import { PinboardTiles } from "./pinboard-tiles";

export interface PinboardPanelProps {
  clicker: Clicker;
  essence: Essence;
  timekeeper: Timekeeper;
  refreshRequestTimestamp: number;
  style?: React.CSSProperties;
}

export interface PinboardPanelState {
  dragOver?: boolean;
}

const Legend = createTeleporter();

export const LegendSpot = Legend.Source;

export class PinboardPanel extends React.Component<PinboardPanelProps, PinboardPanelState> {

  constructor(props: PinboardPanelProps) {
    super(props);
    this.state = {
      dragOver: false
    };
  }

  canDrop(): boolean {
    const dimension = DragManager.draggingDimension();
    return dimension && this.isStringOrBoolean(dimension) && !this.alreadyPinned(dimension);
  }

  isStringOrBoolean({ kind }: Dimension): boolean {
    return kind === "string" || kind === "boolean";
  }

  alreadyPinned({ name }: Dimension): boolean {
    return this.props.essence.pinnedDimensions.has(name);
  }

  dragEnter = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    this.setState({ dragOver: true });
  };

  dragOver = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
  };

  dragLeave = () => {
    if (!this.canDrop()) return;
    this.setState({ dragOver: false });
  };

  drop = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    const dimension = DragManager.draggingDimension();
    if (dimension) {
      this.props.clicker.pin(dimension);
    }
    this.setState({ dragOver: false });
  };

  render() {
    const { clicker, essence, timekeeper, style, refreshRequestTimestamp } = this.props;
    const { dragOver } = this.state;

    return <div
      className="pinboard-panel"
      onDragEnter={this.dragEnter}
      style={style}>
      <Legend.Target />
      <PinboardTiles
        hidePlaceholder={dragOver}
        essence={essence}
        clicker={clicker}
        timekeeper={timekeeper}
        refreshRequestTimestamp={refreshRequestTimestamp} />
      {dragOver && <div className="drop-indicator-tile" />}
      {dragOver && <div
        className="drag-mask"
        onDragOver={this.dragOver}
        onDragLeave={this.dragLeave}
        onDragExit={this.dragLeave}
        onDrop={this.drop}
      />}
    </div>;
  }
}
