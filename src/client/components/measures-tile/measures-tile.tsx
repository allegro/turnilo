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
import { Component, DragEvent, MouseEvent } from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Essence } from "../../../common/models/essence/essence";
import { Measure } from "../../../common/models/measure/measure";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { MAX_SEARCH_LENGTH, STRINGS } from "../../config/constants";
import { findParentWithClass, setDragData, setDragGhost } from "../../utils/dom/dom";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import { MeasureActionsMenu } from "../measure-actions-menu/measure-actions-menu";
import { SearchableTile } from "../searchable-tile/searchable-tile";
import { MEASURE_CLASS_NAME } from "./measure-item";
import { MeasureOrGroupForView, MeasuresConverter } from "./measures-converter";
import { MeasuresRenderer } from "./measures-renderer";

export interface MeasuresTileProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
  appendDirtySeries: Unary<Series, void>;
  style?: React.CSSProperties;
}

export interface MeasuresTileState {
  menuOpenOn?: Element;
  menuMeasure?: Measure;
  showSearch?: boolean;
  searchText?: string;
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
  };

  closeMenu = () => {
    const { menuOpenOn } = this.state;
    if (!menuOpenOn) return;
    this.setState({
      menuOpenOn: null,
      menuMeasure: null
    });
  };

  dragStart = (measureName: string, e: DragEvent<HTMLElement>) => {
    const { essence: { dataCube } } = this.props;
    const measure = dataCube.getMeasure(measureName);

    const dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = "all";
    setDragData(dataTransfer, "text/plain", measure.title);

    DragManager.setDragMeasure(measure);
    setDragGhost(dataTransfer, measure.title);
  };

  toggleSearch = () => {
    const { showSearch } = this.state;
    this.setState({ showSearch: !showSearch });
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

  renderMessageIfNoMeasuresFound(measuresForView: MeasureOrGroupForView[]): JSX.Element {
    const { searchText } = this.state;

    if (!searchText || measuresForView.some(measure => measure.hasSearchText)) return null;
    const noMeasuresFound = `No measures for "${searchText}"`;
    return <div className="message">{noMeasuresFound}</div>;
  }

  render() {
    const { essence, style } = this.props;
    const { showSearch, searchText } = this.state;
    const { dataCube } = essence;

    const measuresConverter = new MeasuresConverter(
      hasSearchTextPredicate(searchText),
      isSelectedMeasurePredicate(essence.series));
    const measuresForView = dataCube.measures.accept(measuresConverter);

    const measuresRenderer = new MeasuresRenderer(this.measureClick, this.dragStart, searchText);
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
    >
      <div className="rows">
        {rows}
        {message}
      </div>

      {this.renderMenu()}
    </SearchableTile>;
  }

  private addSeries = (series: Series) => {
    const { clicker } = this.props;
    clicker.addSeries(series);
  };

  private renderMenu() {
    const { essence, appendDirtySeries, menuStage } = this.props;
    const { menuOpenOn, menuMeasure } = this.state;
    if (!menuMeasure) return null;

    return <MeasureActionsMenu
      appendDirtySeries={appendDirtySeries}
      addSeries={this.addSeries}
      series={essence.series}
      direction="right"
      containerStage={menuStage}
      openOn={menuOpenOn}
      measure={menuMeasure}
      onClose={this.closeMenu}
    />;
  }
}
