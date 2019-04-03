/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import * as ReactDOM from "react-dom";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import { Deferred } from "../../../common/utils/promise/promise";
import { CORE_ITEM_GAP, CORE_ITEM_WIDTH, STRINGS } from "../../config/constants";
import { classNames, findParentWithClass, getXFromEvent, isInside, setDragData, setDragGhost, transformStyle, uniqueId } from "../../utils/dom/dom";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import { getMaxItems, SECTION_WIDTH } from "../../utils/pill-tile/pill-tile";
import { AddTile } from "../add-tile/add-tile";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { FancyDragIndicator } from "../fancy-drag-indicator/fancy-drag-indicator";
import { SplitMenu } from "../split-menu/split-menu";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./split-tile.scss";

const SPLIT_CLASS_NAME = "split";

export interface SplitTileProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
}

export interface SplitTileState {
  menuOpenOn?: Element;
  menuDimension?: Dimension;
  menuSplit?: Split;
  dragPosition?: DragPosition;
  overflowMenuOpenOn?: Element;
  maxItems?: number;
  menuInside?: Element;
}

export class SplitTile extends React.Component<SplitTileProps, SplitTileState> {

  private readonly overflowMenuId = uniqueId("overflow-menu-");
  private overflowMenuDeferred: Deferred<Element>;

  state: SplitTileState = {
    menuOpenOn: null,
    menuDimension: null,
    dragPosition: null,
    maxItems: null
  };

  componentWillReceiveProps(nextProps: SplitTileProps) {
    const { menuStage, essence } = nextProps;
    const { splits } = essence;

    if (menuStage) {
      const newMaxItems = getMaxItems(menuStage.width, splits.splits.count());
      if (newMaxItems !== this.state.maxItems) {
        this.setState({
          menuOpenOn: null,
          menuDimension: null,
          overflowMenuOpenOn: null,
          maxItems: newMaxItems
        });
      }
    }

  }

  componentDidUpdate() {
    const { overflowMenuOpenOn } = this.state;

    if (overflowMenuOpenOn) {
      const overflowMenu = this.getOverflowMenu();
      if (overflowMenu) this.overflowMenuDeferred.resolve(overflowMenu);
    }
  }

  selectDimensionSplit = (dimension: Dimension, split: Split, e: React.MouseEvent<HTMLElement>) => {
    const target = findParentWithClass(e.target as Element, SPLIT_CLASS_NAME);
    this.toggleMenu(dimension, split, target);
    e.stopPropagation();
  }

  toggleMenu(dimension: Dimension, split: Split, target: Element) {
    const { menuOpenOn } = this.state;
    if (menuOpenOn === target) {
      this.closeMenu();
      return;
    }

    this.openMenu(target, dimension, split);
  }

  openMenu(target: Element, dimension: Dimension, split: Split) {
    const overflowMenu = this.getOverflowMenu();
    let menuInside = overflowMenu && isInside(target, overflowMenu) ? overflowMenu : null;

    this.setState({
      menuOpenOn: target,
      menuDimension: dimension,
      menuSplit: split,
      menuInside
    });
  }

  closeMenu = () => {
    const { menuOpenOn } = this.state;
    if (!menuOpenOn) return;
    this.setState({
      menuOpenOn: null,
      menuDimension: null,
      menuInside: null,
      menuSplit: null
    });
  }

  getOverflowMenu(): Element {
    return document.getElementById(this.overflowMenuId);
  }

  openOverflowMenu(target: Element): Promise<Element> {
    if (!target) return Promise.resolve(null);
    var { overflowMenuOpenOn } = this.state;

    if (overflowMenuOpenOn === target) {
      this.closeOverflowMenu();
      return Promise.resolve(null);
    }

    this.overflowMenuDeferred = new Deferred<Element>();
    this.setState({ overflowMenuOpenOn: target });
    return this.overflowMenuDeferred.promise;
  }

  closeOverflowMenu = () => {
    const { overflowMenuOpenOn } = this.state;
    if (!overflowMenuOpenOn) return;
    this.setState({
      overflowMenuOpenOn: null
    });
  }

  removeSplit = (split: Split, e: React.MouseEvent<HTMLElement>) => {
    const { clicker } = this.props;
    clicker.removeSplit(split, VisStrategy.FairGame);
    this.closeMenu();
    this.closeOverflowMenu();
    e.stopPropagation();
  }

  appendSplit = (dimension: Dimension) => {
    this.props.clicker.addSplit(Split.fromDimension(dimension), VisStrategy.FairGame);
  }

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

  dragStart = (dimension: Dimension, split: Split, splitIndex: number, e: React.DragEvent<HTMLElement>) => {
    const dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = "all";
    setDragData(dataTransfer, "text/plain", dimension.title);

    DragManager.setDragSplit(split);
    setDragGhost(dataTransfer, dimension.title);

    this.closeMenu();
    this.closeOverflowMenu();
  }

  calculateDragPosition(e: React.DragEvent<HTMLElement>): DragPosition {
    const { essence } = this.props;
    const numItems = essence.splits.length();
    const rect = ReactDOM.findDOMNode(this.refs["items"]).getBoundingClientRect();
    const x = getXFromEvent(e);
    const offset = x - rect.left;
    return DragPosition.calculateFromOffset(offset, numItems, CORE_ITEM_WIDTH, CORE_ITEM_GAP);
  }

  dragEnter = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    this.setState({
      dragPosition: this.calculateDragPosition(e)
    });
  }

  dragOver = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    const dragPosition = this.calculateDragPosition(e);
    if (dragPosition.equals(this.state.dragPosition)) return;
    this.setState({ dragPosition });
  }

  dragLeave = () => {
    if (!this.canDrop()) return;
    this.setState({
      dragPosition: null
    });
  }

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
    const { clicker, essence: { splits } } = this.props;
    const { maxItems } = this.state;

    this.setState({ dragPosition: null });

    const split = this.draggingSplit();
    if (!split) return;

    let dragPosition = this.calculateDragPosition(e);
    if (dragPosition.replace === maxItems) {
      dragPosition = new DragPosition({ insert: dragPosition.replace });
    }
    if (dragPosition.isReplace()) {
      clicker.changeSplits(splits.replaceByIndex(dragPosition.replace, split), VisStrategy.FairGame);
    } else {
      clicker.changeSplits(splits.insertByIndex(dragPosition.insert, split), VisStrategy.FairGame);
    }
  }

  overflowButtonTarget(): Element {
    return ReactDOM.findDOMNode(this.refs["overflow"]);
  }

  overflowButtonClick = () => {
    this.openOverflowMenu(this.overflowButtonTarget());
  }

  renderMenu(): JSX.Element {
    const { essence, clicker, menuStage } = this.props;
    const { menuOpenOn, menuDimension, menuSplit, menuInside, overflowMenuOpenOn } = this.state;
    if (!menuDimension) return null;

    return <SplitMenu
      clicker={clicker}
      essence={essence}
      containerStage={overflowMenuOpenOn ? null : menuStage}
      openOn={menuOpenOn}
      dimension={menuDimension}
      split={menuSplit}
      onClose={this.closeMenu}
      inside={menuInside}
    />;
  }

  renderOverflowMenu(items: Split[]): JSX.Element {
    const { overflowMenuOpenOn } = this.state;
    if (!overflowMenuOpenOn) return null;

    const segmentHeight = 29 + CORE_ITEM_GAP;

    const splitItems = items.map((item, i) => {
      const style = transformStyle(0, CORE_ITEM_GAP + i * segmentHeight);
      return this.renderSplit(item, style, i);
    });

    return <BubbleMenu
      className="overflow-menu"
      id={this.overflowMenuId}
      direction="down"
      stage={Stage.fromSize(208, CORE_ITEM_GAP + (splitItems.length * segmentHeight))}
      fixedSize={true}
      openOn={overflowMenuOpenOn}
      onClose={this.closeOverflowMenu}
    >
      {splitItems}
    </BubbleMenu>;
  }

  renderOverflow(items: Split[], itemX: number): JSX.Element {
    const style = transformStyle(itemX, 0);
    return <div
      className="overflow dimension"
      ref="overflow"
      key="overflow"
      style={style}
      onClick={this.overflowButtonClick}
    >
      <div className="count">{"+" + items.length}</div>
      {this.renderOverflowMenu(items)}
    </div>;
  }

  renderSplit(split: Split, style: React.CSSProperties, i: number) {
    console.log(split.toJS());
    const { essence: { dataCube } } = this.props;
    const { menuDimension } = this.state;

    const dimension = dataCube.getDimension(split.reference);
    if (!dimension) throw new Error("dimension not found");
    const dimensionName = dimension.name;

    const selected = dimension === menuDimension;
    return <div
      className={classNames(SPLIT_CLASS_NAME, "dimension", { selected })}
      key={split.toKey()}
      ref={dimensionName}
      draggable={true}
      onClick={(e: React.MouseEvent<HTMLElement>) => this.selectDimensionSplit(dimension, split, e)}
      onDragStart={(e: React.DragEvent<HTMLElement>) => this.dragStart(dimension, split, i, e)}
      style={style}
    >
      <div className="reading">{split.getTitle(dataCube.getDimension(split.reference))}</div>
      <div className="remove"
           onClick={(e: React.MouseEvent<HTMLElement>) => this.removeSplit(split, e)}>
        <SvgIcon svg={require("../../icons/x.svg")} />
      </div>
    </div>;
  }

  renderAddTileButton() {
    const { menuStage, essence: { dataCube, splits } } = this.props;
    const tiles = dataCube.dimensions
      .filterDimensions(dimension => !splits.hasSplitOn(dimension))
      .map(dimension => {
        return {
          key: dimension.name,
          label: dimension.title,
          value: dimension
        };
      });

    return <AddTile<Dimension> containerStage={menuStage} onSelect={this.appendSplit} tiles={tiles} />;
  }

  render() {
    const { essence: { splits } } = this.props;
    const { dragPosition, maxItems } = this.state;

    const splitsArray = splits.splits.toArray();

    const splitItems = splitsArray.slice(0, maxItems).map((split, i) => {
      const style = transformStyle(i * SECTION_WIDTH, 0);
      return this.renderSplit(split, style, i);
    }, this);

    const overflowItems = splitsArray.slice(maxItems);
    if (overflowItems.length > 0) {
      const overFlowStart = splitItems.length * SECTION_WIDTH;
      splitItems.push(this.renderOverflow(overflowItems, overFlowStart));
    }

    return <div
      className="split-tile"
      onDragEnter={this.dragEnter}
    >
      <div className="title">{STRINGS.split}</div>
      <div className="items" ref="items">
        {splitItems}
      </div>
      {this.renderAddTileButton()}
      {dragPosition ? <FancyDragIndicator dragPosition={dragPosition} /> : null}
      {dragPosition ? <div
        className="drag-mask"
        onDragOver={this.dragOver}
        onDragLeave={this.dragLeave}
        onDragExit={this.dragLeave}
        onDrop={this.drop}
      /> : null}
      {this.renderMenu()}
    </div>;
  }
}
