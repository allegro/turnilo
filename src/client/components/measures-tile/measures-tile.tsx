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

import { render } from "enzyme";
import { Component, DragEvent, MouseEvent } from "react";
import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Essence } from "../../../common/models/essence/essence";
import { Measure } from "../../../common/models/measure/measure";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { MAX_SEARCH_LENGTH, STRINGS } from "../../config/constants";
import { findParentWithClass, setDragData, setDragGhost } from "../../utils/dom/dom";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import keyCodes from "../../utils/key-codes/key-codes";
import { wrappingListIndex } from "../../utils/wrapping-list-index/wrapping-list-index";
import { GlobalEventListener } from "../global-event-listener/global-event-listener";
import { MeasureActionsMenu } from "../measure-actions-menu/measure-actions-menu";
import { SearchableTile } from "../searchable-tile/searchable-tile";
import { MEASURE_CLASS_NAME } from "./measure-item";
import { MeasureForViewType, MeasureOrGroupForView, MeasuresConverter } from "./measures-converter";
import { MeasuresRenderer } from "./measures-renderer";

export interface MeasuresTileProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
  style?: React.CSSProperties;
}

export interface MeasuresTileState {
  menuOpenOn?: Element;
  menuMeasure?: Measure;
  showSearch?: boolean;
  searchText?: string;
  highlightedMeasureName?: string;
}

export type MeasureClickHandler = (measureName: string, e: MouseEvent<HTMLElement>) => void;
export type MeasureDragStartHandler = (measureName: string, e: DragEvent<HTMLElement>) => void;

const hasSearchTextPredicate = (searchText: string) => (measure: Measure): boolean => {
  return searchText != null && searchText !== "" && measure.title.toLowerCase().includes(searchText.toLowerCase());
};

const isSelectedMeasurePredicate = (seriesList: SeriesList) => (measure: Measure): boolean => {
  return seriesList.hasMeasure(measure);
};

export class MeasuresTile extends Component<MeasuresTileProps, MeasuresTileState> {
  readonly state: MeasuresTileState = {
    showSearch: false,
    searchText: "",
    menuOpenOn: null,
    menuMeasure: null
  };

  measureClick = (measureName: string, e: MouseEvent<HTMLElement>) => {
    const { menuOpenOn } = this.state;
    const target = findParentWithClass(e.target as Element, MEASURE_CLASS_NAME);
    if (menuOpenOn === target) {
      this.closeMenu();
      return;
    }

    const { essence: { dataCube } } = this.props;
    const measure = dataCube.measures.getMeasureByName(measureName);

    this.setState({
      menuOpenOn: target,
      menuMeasure: measure
    });
  }

  closeMenu = () => {
    const { menuOpenOn } = this.state;
    if (!menuOpenOn) return;
    this.setState({
      menuOpenOn: null,
      menuMeasure: null
    });
  }

  dragStart = (measureName: string, e: DragEvent<HTMLElement>) => {
    const { essence: { dataCube } } = this.props;
    const measure = dataCube.getMeasure(measureName);

    const dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = "all";
    setDragData(dataTransfer, "text/plain", measure.title);

    DragManager.setDragMeasure(measure);
    setDragGhost(dataTransfer, measure.title);
  }

  toggleSearch = () => {
    var { showSearch } = this.state;
    this.setState({ showSearch: !showSearch, highlightedMeasureName: undefined });
    this.onSearchChange("");
  }

  onSearchChange = (text: string) => {
    const { searchText } = this.state;
    const newSearchText = text.substr(0, MAX_SEARCH_LENGTH);

    if (searchText === newSearchText) return; // nothing to do;

    this.setState({
      searchText: newSearchText
    });
  }

  renderMessageIfNoMeasuresFound(measuresForView: MeasureOrGroupForView[]): JSX.Element {
    const { searchText } = this.state;

    if (!searchText || measuresForView.some(measure => measure.hasSearchText)) return null;
    const noMeasuresFound = `No measures for "${searchText}"`;
    return <div className="message">{noMeasuresFound}</div>;
  }

  private handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (e.shiftKey && e.keyCode === keyCodes.m) {
      const element = e.target as HTMLElement;
      if (element.tagName !== "INPUT" && element.tagName !== "TEXTAREA") {
        e.preventDefault();
        this.toggleSearch();
      }
    }
  }

  private keyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const { essence, clicker } = this.props;
    const { highlightedMeasureName } = this.state;

    if (e.keyCode === keyCodes.up || e.keyCode === keyCodes.down) {
      e.preventDefault();
      const measuresForView = this.measuresForView();

      const indexOfCurrentlyHighlightedMeasure = measuresForView.findIndex(measure => measure.name === highlightedMeasureName);
      const indexOfHighlightedMeasure = wrappingListIndex(
        indexOfCurrentlyHighlightedMeasure,
        measuresForView.length,
        e.keyCode === keyCodes.down ? +1 : -1
      );

      this.setState({ highlightedMeasureName: measuresForView[indexOfHighlightedMeasure].name });
    }

    if (highlightedMeasureName && e.keyCode === keyCodes.space) {
      e.preventDefault();
      const measure = essence.dataCube.measures.getMeasureByName(highlightedMeasureName);
      clicker.addSeries(Series.fromMeasure(measure));
    }
  }

  private measuresForView = () => {
    const { essence } = this.props;
    const { searchText } = this.state;
    const { dataCube } = essence;
    const measuresConverter = new MeasuresConverter(hasSearchTextPredicate(searchText), isSelectedMeasurePredicate(essence.series));
    return dataCube.measures.accept(measuresConverter).filter(item => !searchText || item.hasSearchText || item.type === MeasureForViewType.group);
  }

    render() {
      const { essence, style } = this.props;
      const { showSearch, searchText, highlightedMeasureName } = this.state;
      const { dataCube } = essence;
      const measuresForView = this.measuresForView();

      const measuresRenderer = new MeasuresRenderer(this.measureClick, this.dragStart, searchText, highlightedMeasureName);
      const rows = measuresRenderer.render(measuresForView);
      const message = this.renderMessageIfNoMeasuresFound(measuresForView);

      const icons = [{
      name: "search",
      ref: "search",
      onClick: this.toggleSearch,
      svg: require("../../icons/full-search.svg"),
      active: showSearch
    }];

      return <SearchableTile
      style={style}
      title={STRINGS.measures}
      toggleChangeFn={this.toggleSearch}
      onSearchChange={this.onSearchChange}
      searchText={searchText}
      showSearch={showSearch}
      icons={icons}
      className="measures-tile"
      onKeyDown={this.keyDown}
    >
      <GlobalEventListener keyDown={this.handleGlobalKeyDown} />
      <div className="rows">
        {rows}
        {message}
      </div>

      {this.renderMenu()}
    </SearchableTile>;
  }

  private renderMenu() {
    const { essence, clicker, menuStage } = this.props;
    const { menuOpenOn, menuMeasure } = this.state;
    if (!menuMeasure) return null;

    return <MeasureActionsMenu
      clicker={clicker}
      essence={essence}
      direction="right"
      containerStage={menuStage}
      openOn={menuOpenOn}
      measure={menuMeasure}
      onClose={this.closeMenu}
    />;
  }
}
