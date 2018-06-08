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
import { Component, CSSProperties, DragEvent, MouseEvent } from "react";
import { Clicker, DataCube, Dimension, Essence, Filter, Splits, Stage } from "../../../common/models/index";
import { Fn } from "../../../common/utils/general/general";
import { MAX_SEARCH_LENGTH, STRINGS } from "../../config/constants";
import { findParentWithClass, setDragGhost } from "../../utils/dom/dom";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import { DimensionActionsMenu } from "../dimension-actions-menu/dimension-actions-menu";
import { SearchableTile } from "../searchable-tile/searchable-tile";
import { TileHeaderIcon } from "../tile-header/tile-header";
import { DIMENSION_CLASS_NAME } from "./dimension-item";
import "./dimension-list-tile.scss";
import { DimensionOrGroupForView, DimensionsConverter } from "./dimensions-converter";
import { DimensionsRenderer } from "./dimensions-renderer";

export interface DimensionListTileProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
  triggerFilterMenu: Fn;
  triggerSplitMenu: Fn;
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
  const { dataCube, filter, splits } = essence;
  return isFiltered(dimension, filter, dataCube) || isSplit(dimension, splits, dataCube);
};

const isSplit = (dimension: Dimension, splits: Splits, dataCube: DataCube): boolean => {
  return splits
    .splitCombines
    .map(split => dataCube.dimensions.getDimensionByExpression(split.expression))
    .contains(dimension);
};

const isFiltered = (dimension: Dimension, filter: Filter, dataCube: DataCube): boolean => {
  return filter
    .clauses
    .map(clause => dataCube.dimensions.getDimensionByExpression(clause.expression))
    .contains(dimension);
};

const isSelectedDimensionPredicate = (menuDimension: Dimension) => (dimension: Dimension): boolean => {
  return menuDimension === dimension;
};

export class DimensionListTile extends Component<DimensionListTileProps, DimensionListTileState> {

  constructor(props: DimensionListTileProps) {
    super(props);
    this.state = {
      menuOpenOn: null,
      menuDimension: null,
      showSearch: false,
      searchText: ""
    };
  }

  clickDimension = (dimensionName: string, e: MouseEvent<HTMLElement>) => {
    const { menuOpenOn } = this.state;
    const target = findParentWithClass(e.target as Element, DIMENSION_CLASS_NAME);
    if (menuOpenOn === target) {
      this.closeMenu();
      return;
    }

    const { essence: { dataCube } } = this.props;
    const dimension = dataCube.dimensions.getDimensionByName(dimensionName);

    this.setState({
      menuOpenOn: target,
      menuDimension: dimension
    });
  }

  closeMenu() {
    var { menuOpenOn } = this.state;
    if (!menuOpenOn) return;
    this.setState({
      menuOpenOn: null,
      menuDimension: null
    });
  }

  dragStart = (dimensionName: string, e: DragEvent<HTMLElement>) => {
    const { essence: { dataCube } } = this.props;
    const dimension = dataCube.dimensions.getDimensionByName(dimensionName);

    const dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = "all";
    dataTransfer.setData("text/plain", dimension.title);

    DragManager.setDragDimension(dimension, "dimension-list-tile");
    setDragGhost(dataTransfer, dimension.title);

    this.closeMenu();
  }

  toggleSearch() {
    var { showSearch } = this.state;
    this.setState({ showSearch: !showSearch });
    this.onSearchChange("");
  }

  onSearchChange(text: string) {
    var { searchText } = this.state;
    var newSearchText = text.substr(0, MAX_SEARCH_LENGTH);

    if (searchText === newSearchText) return; // nothing to do;

    this.setState({
      searchText: newSearchText
    });
  }

  renderMenu(): JSX.Element {
    var { essence, clicker, menuStage, triggerFilterMenu, triggerSplitMenu } = this.props;
    var { menuOpenOn, menuDimension } = this.state;
    if (!menuDimension) return null;
    var onClose = this.closeMenu.bind(this);

    return <DimensionActionsMenu
      clicker={clicker}
      essence={essence}
      direction="right"
      containerStage={menuStage}
      openOn={menuOpenOn}
      dimension={menuDimension}
      triggerFilterMenu={triggerFilterMenu}
      triggerSplitMenu={triggerSplitMenu}
      onClose={onClose}
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

    const dimensionsConverter = new DimensionsConverter(
      hasSearchTextPredicate(searchText),
      isFilteredOrSplitPredicate(essence),
      isSelectedDimensionPredicate(menuDimension)
    );
    const dimensionsForView = dataCube.dimensions.accept(dimensionsConverter);

    const dimensionsRenderer = new DimensionsRenderer(this.clickDimension, this.dragStart, searchText);
    const items = dimensionsRenderer.render(dimensionsForView);
    const message = this.renderMessageIfNoDimensionsFound(dimensionsForView);

    var icons: TileHeaderIcon[] = [
      {
        name: "search",
        ref: "search",
        onClick: this.toggleSearch.bind(this),
        svg: require("../../icons/full-search.svg"),
        active: showSearch
      }
    ];

    return <SearchableTile
      style={style}
      title={STRINGS.dimensions}
      toggleChangeFn={this.toggleSearch.bind(this)}
      onSearchChange={this.onSearchChange.bind(this)}
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
