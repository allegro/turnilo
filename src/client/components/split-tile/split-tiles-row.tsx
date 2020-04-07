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
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import { CORE_ITEM_GAP, CORE_ITEM_WIDTH, STRINGS } from "../../config/constants";
import { getXFromEvent, setDragData, setDragGhost } from "../../utils/dom/dom";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import { getMaxItems } from "../../utils/pill-tile/pill-tile";
import { DragIndicator } from "../drag-indicator/drag-indicator";
import { AddSplit } from "./add-split";
import "./split-tile.scss";
import { SplitTiles } from "./split-tiles";

interface SplitTilesRowProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
}

interface SplitTilesRowState {
  dragPosition?: DragPosition;
  openedSplit?: Split;
  overflowOpen?: boolean;
}

export class SplitTilesRow extends React.Component<SplitTilesRowProps, SplitTilesRowState> {
  private items = React.createRef<HTMLDivElement>();

  state: SplitTilesRowState = {};

  private maxItems(): number {
    const { menuStage, essence: { splits: { splits } } } = this.props;
    return menuStage && getMaxItems(menuStage.width, splits.count());
  }

  openMenu = (split: Split) => this.setState({ openedSplit: split });

  closeMenu = () => this.setState({ openedSplit: null });

  openOverflowMenu = () => this.setState({ overflowOpen: true });

  closeOverflowMenu = () => this.setState({ overflowOpen: false });

  updateSplit = (oldSplit: Split, split: Split) => {
    const { essence, clicker } = this.props;
    clicker.changeSplits(essence.splits.replace(oldSplit, split), VisStrategy.UnfairGame);
  };

  removeSplit = (split: Split) => {
    const { clicker } = this.props;
    clicker.removeSplit(split, VisStrategy.FairGame);
    this.closeOverflowMenu();
  };

  canDrop(): boolean {
    const { essence: { splits, dataCube } } = this.props;
    const dimension = DragManager.draggingDimension();
    if (dimension) return !splits.hasSplitOn(dimension);
    if (DragManager.isDraggingFilter()) {
      const dimension = dataCube.getDimension(DragManager.draggingFilter().reference);
      return dimension && !splits.hasSplitOn(dimension);
    }
    return DragManager.isDraggingSplit();
  }

  dragStart = (label: string, split: Split, e: React.DragEvent<HTMLElement>) => {
    const dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = "all";
    setDragData(dataTransfer, "text/plain", label);

    DragManager.setDragSplit(split);
    setDragGhost(dataTransfer, label);

    this.closeOverflowMenu();
  };

  calculateDragPosition(e: React.DragEvent<HTMLElement>): DragPosition {
    const { essence } = this.props;
    const numItems = essence.splits.length();
    const rect = this.items.current.getBoundingClientRect();
    const x = getXFromEvent(e);
    const offset = x - rect.left;
    const position = DragPosition.calculateFromOffset(offset, numItems, CORE_ITEM_WIDTH, CORE_ITEM_GAP);
    if (position.replace === this.maxItems()) {
      return new DragPosition({ insert: position.replace });
    }
    return position;
  }

  dragEnter = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    this.setState({
      dragPosition: this.calculateDragPosition(e)
    });
  };

  dragOver = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    const dragPosition = this.calculateDragPosition(e);
    if (dragPosition.equals(this.state.dragPosition)) return;
    this.setState({ dragPosition });
  };

  dragLeave = () => {
    if (!this.canDrop()) return;
    this.setState({
      dragPosition: null
    });
  };

  draggingSplit(): Split {
    const { essence: { dataCube } } = this.props;
    if (DragManager.isDraggingSplit()) return DragManager.draggingSplit();
    if (DragManager.isDraggingFilter()) {
      const dimension = dataCube.getDimension(DragManager.draggingFilter().reference);
      return Split.fromDimension(dimension);
    }
    return Split.fromDimension(DragManager.draggingDimension());
  }

  drop = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    this.setState({ dragPosition: null });

    const split = this.draggingSplit();
    if (!split) return;

    const dragPosition = this.calculateDragPosition(e);
    if (dragPosition.isReplace()) {
      if (dragPosition.replace === this.maxItems()) {
        this.insertSplit(split, dragPosition.replace);
      } else {
        this.replaceSplit(split, dragPosition.replace);
      }
    } else {
      this.insertSplit(split, dragPosition.insert);
    }
  };

  appendSplit = (dimension: Dimension) => {
    this.props.clicker.addSplit(Split.fromDimension(dimension), VisStrategy.FairGame);
  };

  insertSplit = (split: Split, index: number) => {
    const { clicker, essence: { splits } } = this.props;
    clicker.changeSplits(splits.insertByIndex(index, split), VisStrategy.FairGame);
  };

  replaceSplit = (split: Split, index: number) => {
    const { clicker, essence: { splits } } = this.props;
    clicker.changeSplits(splits.replaceByIndex(index, split), VisStrategy.FairGame);
  };

  render() {
    const { essence, menuStage } = this.props;
    const { dragPosition, overflowOpen, openedSplit } = this.state;
    return <div className="split-tile" onDragEnter={this.dragEnter}>
      <div className="title">{STRINGS.split}</div>
      <div className="items" ref={this.items}>
        <SplitTiles
          essence={essence}
          openedSplit={openedSplit}
          removeSplit={this.removeSplit}
          updateSplit={this.updateSplit}
          openMenu={this.openMenu}
          closeMenu={this.closeMenu}
          dragStart={this.dragStart}
          menuStage={menuStage}
          maxItems={this.maxItems()}
          overflowOpen={overflowOpen}
          closeOverflowMenu={this.closeOverflowMenu}
          openOverflowMenu={this.openOverflowMenu} />
      </div>
      <DragIndicator dragOver={this.dragOver} dragLeave={this.dragLeave} drop={this.drop} dragPosition={dragPosition} />
      <AddSplit appendSplit={this.appendSplit} menuStage={menuStage} essence={essence} />
    </div>;
  }
}
