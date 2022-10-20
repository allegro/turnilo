/*
 * Copyright 2017-2021 Allegro.pl
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
import { getTimeDimensionReference } from "../../../common/models/data-cube/data-cube";
import { Dimension } from "../../../common/models/dimension/dimension";
import { findDimensionByName } from "../../../common/models/dimension/dimensions";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { FilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Locale } from "../../../common/models/locale/locale";
import { Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Binary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { CORE_ITEM_GAP, CORE_ITEM_WIDTH, STRINGS } from "../../config/constants";
import { getXFromEvent, setDragData, setDragGhost } from "../../utils/dom/dom";
import { DraggedElementType, DragManager } from "../../utils/drag-manager/drag-manager";
import { getMaxItems } from "../../utils/pill-tile/pill-tile";
import { CubeContext, CubeContextValue } from "../../views/cube-view/cube-context";
import { PartialFilter } from "../../views/cube-view/partial-tiles-provider";
import { DragIndicator } from "../drag-indicator/drag-indicator";
import { AddFilter } from "./add-filter";
import { FilterTiles } from "./filter-tiles";

interface FilterTilesRowProps {
  menuStage: Stage;
  timekeeper: Timekeeper;
  locale: Locale;
  removePartialFilter: Fn;
  addPartialFilter: Binary<Dimension, DragPosition, void>;
  partialFilter?: PartialFilter;
}

interface FilterTilesRowState {
  dragPosition?: DragPosition;
  openedClause?: FilterClause;
  overflowOpen?: boolean;
}

export class FilterTilesRow extends React.Component<FilterTilesRowProps, FilterTilesRowState> {
  static contextType = CubeContext;
  context: CubeContextValue;

  state: FilterTilesRowState = {};
  private items = React.createRef<HTMLDivElement>();

  private maxItems(): number {
    const { essence: { filter } } = this.context;
    const { menuStage } = this.props;
    return menuStage && getMaxItems(menuStage.width, filter.length());
  }

  openFilterMenu = (clause: FilterClause) => this.setState({ openedClause: clause });

  closeFilterMenu = () => this.setState({ openedClause: null });

  openOverflowMenu = () => this.setState({ overflowOpen: true });

  closeOverflowMenu = () => this.setState({ overflowOpen: false });

  canDrop(): boolean {
    const { essence: { filter } } = this.context;
    switch (DragManager.dragging.type) {
      case DraggedElementType.DIMENSION:
        return !filter.getClauseForDimension(DragManager.draggingDimension());
      case DraggedElementType.SPLIT:
        return !filter.clauseForReference(DragManager.draggingSplit().reference);
      case DraggedElementType.FILTER:
        return true;
      case DraggedElementType.MEASURE:
        return false;
      case DraggedElementType.SERIES:
        return false;
      case DraggedElementType.NONE:
        return false;
    }
  }

  dragStart = (dimension: Dimension, clause: FilterClause, e: React.DragEvent<HTMLElement>) => {
    const label = dimension.title;
    const dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = "all";
    setDragData(dataTransfer, "text/plain", label);

    DragManager.setDragFilter(clause);
    setDragGhost(dataTransfer, label);

    this.closeOverflowMenu();
  };

  calculateDragPosition(e: React.DragEvent<HTMLElement>): DragPosition {
    const { essence } = this.context;
    const numItems = essence.filter.length();
    const rect = this.items.current.getBoundingClientRect();
    const offset = getXFromEvent(e) - rect.left;
    const position = DragPosition.calculateFromOffset(offset, numItems, CORE_ITEM_WIDTH, CORE_ITEM_GAP);
    if (position.replace === this.maxItems()) {
      return DragPosition.insertAt(position.replace);
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
    this.setState({ dragPosition: null });
  };

  drop = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    this.setState({ dragPosition: null });

    const position = this.calculateDragPosition(e);
    switch (DragManager.dragging.type) {
      case DraggedElementType.DIMENSION:
        this.dropDimension(DragManager.draggingDimension(), position);
        break;
      case DraggedElementType.FILTER:
        this.dropFilter(DragManager.draggingFilter(), position);
        break;
      case DraggedElementType.SPLIT:
        this.dropSplit(DragManager.draggingSplit(), position);
        break;
    }
  };

  private dropSplit(split: Split, position: DragPosition) {
    const { essence: { dataCube: { dimensions } } } = this.context;
    const dimension = findDimensionByName(dimensions, split.reference);
    this.dropDimension(dimension, position);
  }

  private dropDimension(dimension: Dimension, position: DragPosition) {
    const { essence: { filter, dataCube } } = this.context;
    const { addPartialFilter } = this.props;
    let tryingToReplaceTime = false;
    if (position.isReplace()) {
      const targetClause = filter.clauses.get(position.replace);
      tryingToReplaceTime = targetClause && targetClause.reference === getTimeDimensionReference(dataCube);
      if (tryingToReplaceTime) return;
    }
    addPartialFilter(dimension, position);
  }

  private dropFilter(clause: FilterClause, position: DragPosition) {
    const { clicker, essence: { filter } } = this.context;
    const newFilter = position.isReplace()
      ? filter.replaceByIndex(position.replace, clause)
      : filter.insertByIndex(position.insert, clause);
    if (!filter.equals(newFilter)) {
      clicker.changeFilter(newFilter);
    }
  }

  appendFilter = (dimension: Dimension) => {
    const { essence } = this.context;
    const { addPartialFilter } = this.props;
    addPartialFilter(dimension, DragPosition.insertAt(essence.filter.length()));
  }

  removeFilter = (clause: FilterClause) => {
    const { essence, clicker } = this.context;
    clicker.changeFilter(essence.filter.removeClause(clause.reference));
    this.closeOverflowMenu();
  }

  render() {
    const { dragPosition, openedClause, overflowOpen } = this.state;
    const { menuStage, timekeeper, locale, partialFilter, removePartialFilter } = this.props;
    const { essence, clicker } = this.context;
    return <div className="tile-row filter-tile-row" onDragEnter={this.dragEnter}>
      <div className="title">{STRINGS.filter}</div>
      <div className="items" ref={this.items}>
        <FilterTiles
          menuStage={menuStage}
          maxItems={this.maxItems()}
          essence={essence}
          clicker={clicker}
          timekeeper={timekeeper}
          locale={locale}
          removeFilter={this.removeFilter}
          openFilterMenu={this.openFilterMenu}
          closeFilterMenu={this.closeFilterMenu}
          dragStart={this.dragStart}
          removePartialFilter={removePartialFilter}
          partialFilter={partialFilter}
          overflowOpen={overflowOpen}
          closeOverflowMenu={this.closeOverflowMenu}
          openedFilterMenu={openedClause}
          openOverflowMenu={this.openOverflowMenu}/>
      </div>
      <AddFilter
        menuStage={menuStage}
        essence={essence}
        appendFilter={this.appendFilter}/>
      <DragIndicator
        dragOver={this.dragOver}
        dragLeave={this.dragLeave}
        drop={this.drop}
        dragPosition={dragPosition}/>
    </div>;
  }
}
