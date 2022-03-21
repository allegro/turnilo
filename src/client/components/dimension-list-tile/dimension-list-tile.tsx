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
import { Component, CSSProperties, DragEvent, MouseEvent } from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { findDimensionByName } from "../../../common/models/dimension/dimensions";
import { Essence } from "../../../common/models/essence/essence";
import { Filter } from "../../../common/models/filter/filter";
import { Splits } from "../../../common/models/splits/splits";
import { Stage } from "../../../common/models/stage/stage";
import { MAX_SEARCH_LENGTH, STRINGS } from "../../config/constants";
import { findParentWithClass, setDragData, setDragGhost } from "../../utils/dom/dom";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import { DimensionActionsMenu } from "../dimension-actions-menu/dimension-actions-menu";
import { SearchableTile } from "../searchable-tile/searchable-tile";
import { TileHeaderIcon } from "../tile-header/tile-header";
import { DIMENSION_CLASS_NAME } from "./dimension-item";
import "./dimension-list-tile.scss";
import { convert, DimensionOrGroupForView } from "./dimensions-converter";
import { DimensionsRenderer } from "./dimensions-renderer";

export interface DimensionListTileProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
  addPartialFilter: (dimension: Dimension) => void;
  style?: CSSProperties;
}

export interface DimensionListTileState {
  menuOpenOn?: Element;
  menuDimension?: Dimension;
  showSearch?: boolean;
  searchText?: string;
}

const hasSearchTextPredicate = (searchText: string) => (dimension: Dimension): boolean => {
  return dimension.title.toLowerCase().includes(searchText.toLowerCase());
};

const isFilteredOrSplitPredicate = (essence: Essence) => (dimension: Dimension): boolean => {
  const { filter, splits } = essence;
  return isFiltered(dimension, filter) || isSplit(dimension, splits);
};

const isSplit = (dimension: Dimension, { splits }: Splits): boolean => {
  return splits
    .map(split => split.reference)
    .contains(dimension.name);
};

const isFiltered = (dimension: Dimension, filter: Filter): boolean => {
  return filter
    .clauses
    .map(clause => clause.reference)
    .contains(dimension.name);
};

const isSelectedDimensionPredicate = (menuDimension: Dimension) => (dimension: Dimension): boolean => {
  return menuDimension === dimension;
};

export class DimensionListTile extends Component<DimensionListTileProps, DimensionListTileState> {
  state: DimensionListTileState = {
    menuOpenOn: null,
    menuDimension: null,
    showSearch: false,
    searchText: ""
  };

  private clickDimension = (dimensionName: string, e: MouseEvent<HTMLElement>) => {
    const { menuOpenOn } = this.state;
    const target = findParentWithClass(e.currentTarget, DIMENSION_CLASS_NAME);
    if (menuOpenOn === target) {
      this.closeMenu();
      return;
    }

    const { essence: { dataCube } } = this.props;
    const dimension = findDimensionByName(dataCube.dimensions, dimensionName);

    this.setState({
      menuOpenOn: target,
      menuDimension: dimension
    });
  };

  closeMenu = () => {
    const { menuOpenOn } = this.state;
    if (!menuOpenOn) return;
    this.setState({
      menuOpenOn: null,
      menuDimension: null
    });
  };

  dragStart = (dimensionName: string, e: DragEvent<HTMLElement>) => {
    const { essence: { dataCube } } = this.props;
    const dimension = findDimensionByName(dataCube.dimensions, dimensionName);

    const dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = "all";
    setDragData(dataTransfer, "text/plain", dimension.title);

    DragManager.setDragDimension(dimension);
    setDragGhost(dataTransfer, dimension.title);

    this.closeMenu();
  };

  toggleSearch = () => {
    this.setState(({ showSearch }) => ({ showSearch: !showSearch }));
    this.onSearchChange("");
  };

  onSearchChange = (text: string) => {
    const { searchText } = this.state;
    const newSearchText = text.substr(0, MAX_SEARCH_LENGTH);

    if (searchText === newSearchText) return; // nothing to do;

    this.setState({
      searchText: newSearchText
    });
  };

  renderMenu(): JSX.Element {
    const { essence, clicker, menuStage, addPartialFilter } = this.props;
    const { menuOpenOn, menuDimension } = this.state;
    if (!menuDimension) return null;

    return <DimensionActionsMenu
      clicker={clicker}
      essence={essence}
      direction="right"
      containerStage={menuStage}
      openOn={menuOpenOn}
      dimension={menuDimension}
      addPartialFilter={addPartialFilter}
      onClose={this.closeMenu}
    />;
  }

  private renderMessageIfNoDimensionsFound(dimensionsForView: DimensionOrGroupForView[]) {
    const { searchText } = this.state;

    if (!!searchText && !dimensionsForView.some(dimension => dimension.hasSearchText)) {
      const noDimensionsFound = `No dimensions for "${searchText}"`;
      return <div className="message">{noDimensionsFound}</div>;
    } else {
      return null;
    }
  }

  render() {
    const { essence, style } = this.props;
    const { menuDimension, showSearch, searchText } = this.state;
    const { dataCube } = essence;

    const dimensionsForView = convert(
      dataCube.dimensions,
      hasSearchTextPredicate(searchText),
      isFilteredOrSplitPredicate(essence),
      isSelectedDimensionPredicate(menuDimension)
    );

    const dimensionsRenderer = new DimensionsRenderer(this.clickDimension, this.dragStart, searchText);
    const items = dimensionsRenderer.render(dimensionsForView);
    const message = this.renderMessageIfNoDimensionsFound(dimensionsForView);

    const icons: TileHeaderIcon[] = [
      {
        name: "search",
        ref: "search",
        onClick: this.toggleSearch,
        svg: require("../../icons/full-search.svg"),
        active: showSearch
      }
    ];

    return <SearchableTile
      style={style}
      title={STRINGS.dimensions}
      toggleChangeFn={this.toggleSearch}
      onSearchChange={this.onSearchChange}
      searchText={searchText}
      showSearch={showSearch}
      icons={icons}
      className="dimension-list-tile"
    >
      <div className="rows" ref="items">
        {items}
        {message}
      </div>

      {this.renderMenu()}
    </SearchableTile>;

  }
}
