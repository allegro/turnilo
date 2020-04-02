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
import { Colors } from "../../../common/models/colors/colors";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { SortOn } from "../../../common/models/sort-on/sort-on";
import { SortDirection } from "../../../common/models/sort/sort";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import { DimensionTile } from "../dimension-tile/dimension-tile";
import { PinboardMeasureTile } from "../pinboard-measure-tile/pinboard-measure-tile";
import "./pinboard-panel.scss";
import { PinboardTiles } from "./pinboard-tiles";

export interface PinboardPanelProps {
  clicker: Clicker;
  essence: Essence;
  timekeeper: Timekeeper;
  style?: React.CSSProperties;
}

export interface PinboardPanelState {
  dragOver?: boolean;
}

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

  getColorsSortOn(): SortOn {
    const { essence } = this.props;
    const { dataCube, splits, colors } = essence;
    if (colors) {
      const dimension = dataCube.getDimension(colors.dimension);
      if (dimension) {
        const split = splits.findSplitForDimension(dimension);
        if (split) {
          return SortOn.fromSort(split.sort, essence);
        }
      }
    }
    return null;
  }

  onLegendSortOnSelect = (sortOn: SortOn) => {
    const { clicker, essence } = this.props;
    const { dataCube, splits, colors } = essence;
    if (colors) {
      const dimension = dataCube.getDimension(colors.dimension);
      if (dimension) {
        const split = splits.findSplitForDimension(dimension);
        if (split) {
          const sort = split.sort;
          const direction = sort ? sort.direction : SortDirection.descending;
          const newSplit = split.changeSort(sortOn.toSort(direction));
          const newColors = Colors.fromLimit(colors.dimension, 5);
          clicker.changeSplits(splits.replace(split, newSplit), VisStrategy.UnfairGame, newColors);
        }
      }
    }
  };

  onRemoveLegend = () => {
    const { clicker, essence } = this.props;
    const { dataCube, splits, colors } = essence;

    if (colors) {
      const dimension = dataCube.getDimension(colors.dimension);
      if (dimension) {
        const split = splits.findSplitForDimension(dimension);
        if (split) {
          clicker.changeSplits(splits.removeSplit(split), VisStrategy.UnfairGame, null);
        }
      }
    }
  };

  render() {
    const { clicker, essence, timekeeper, style } = this.props;
    const { dragOver } = this.state;
    const { dataCube, colors } = essence;

    let legendMeasureSelector: JSX.Element = null;
    let legendDimensionTile: JSX.Element = null;
    let colorDimension = colors ? colors.dimension : null;
    if (colorDimension) {
      const dimension = dataCube.getDimension(colorDimension);
      const colorsSortOn = this.getColorsSortOn();
      if (dimension && colorsSortOn) {
        legendMeasureSelector = <PinboardMeasureTile
          essence={essence}
          title="Legend"
          dimension={dimension}
          sortOn={colorsSortOn}
          onSelect={this.onLegendSortOnSelect}
        />;

        legendDimensionTile = <DimensionTile
          clicker={clicker}
          essence={essence}
          timekeeper={timekeeper}
          dimension={dimension}
          sortOn={colorsSortOn}
          colors={colors}
          onClose={this.onRemoveLegend}
        />;
      }
    }

    return <div
      className="pinboard-panel"
      onDragEnter={this.dragEnter}
      style={style}
    >
      {legendMeasureSelector}
      {legendDimensionTile}
      <PinboardTiles
        hidePlaceholder={dragOver}
        essence={essence}
        clicker={clicker}
        timekeeper={timekeeper} />
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
