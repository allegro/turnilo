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

import { OrderedSet } from "immutable";
import * as React from "react";
import { Component, MouseEvent } from "react";
import { Clicker, Essence, Measure } from "../../../common/models";
import { MAX_SEARCH_LENGTH, STRINGS } from "../../config/constants";
import * as localStorage from "../../utils/local-storage/local-storage";
import { SearchableTile } from "../searchable-tile/searchable-tile";
import { TileHeaderIcon } from "../tile-header/tile-header";
import { MeasureOrGroupForView, MeasuresConverter } from "./measures-converter";
import { MeasuresRenderer } from "./measures-renderer";

export interface MeasuresTileProps {
  clicker: Clicker;
  essence: Essence;
  style?: React.CSSProperties;
}

export const initialState = {
  showSearch: false,
  searchText: ""
};

export type MeasuresTileState = Readonly<typeof initialState>;

export type MeasureClickHandler = (measureName: string, e: MouseEvent<HTMLElement>) => void;

const hasSearchTextPredicate = (searchText: string) => (measure: Measure): boolean => {
  return searchText != null && searchText !== "" && measure.title.toLowerCase().includes(searchText.toLowerCase());
};

const isSelectedMeasurePredicate = (selectedMeasures: OrderedSet<string>) => (measure: Measure): boolean => {
  return selectedMeasures.contains(measure.name);
};

export class MeasuresTile extends Component<MeasuresTileProps, MeasuresTileState> {
  readonly state: MeasuresTileState = initialState;

  measureClick = (measureName: string) => {
    const { clicker, essence: { dataCube } } = this.props;
    const measure = dataCube.measures.getMeasureByName(measureName);
    clicker.toggleEffectiveMeasure(measure);
  }

  toggleSearch = () => {
    var { showSearch } = this.state;
    this.setState({ showSearch: !showSearch });
    this.onSearchChange("");
  }

  onSearchChange = (text: string) => {
    var { searchText } = this.state;
    var newSearchText = text.substr(0, MAX_SEARCH_LENGTH);

    if (searchText === newSearchText) return; // nothing to do;

    this.setState({
      searchText: newSearchText
    });
  }

  toggleMultiMeasure = () => {
    var { clicker, essence } = this.props;
    clicker.toggleMultiMeasureMode();
    localStorage.set("is-multi-measure", !essence.getEffectiveMultiMeasureMode());
  }

  renderMessageIfNoMeasuresFound(measuresForView: MeasureOrGroupForView[]): JSX.Element {
    const { searchText } = this.state;

    if (!!searchText && !measuresForView.some(measure => measure.hasSearchText)) {
      const noMeasuresFound = `No measures for "${searchText}"`;
      return <div className="message">{noMeasuresFound}</div>;
    } else {
      return null;
    }
  }

  render() {
    const { essence, style } = this.props;
    const { showSearch, searchText } = this.state;
    const { dataCube } = essence;
    const multiMeasureMode = essence.getEffectiveMultiMeasureMode();
    const selectedMeasures = essence.getEffectiveSelectedMeasure();

    const measuresConverter = new MeasuresConverter(hasSearchTextPredicate(searchText), isSelectedMeasurePredicate(selectedMeasures));
    const measuresForView = dataCube.measures.accept(measuresConverter);

    const measuresRenderer = new MeasuresRenderer(this.measureClick, multiMeasureMode, searchText);
    const rows = measuresRenderer.render(measuresForView);
    const message = this.renderMessageIfNoMeasuresFound(measuresForView);

    const icons: TileHeaderIcon[] = [];

    if (!essence.isFixedMeasureMode()) {
      icons.push({
        name: "multi",
        onClick: this.toggleMultiMeasure,
        svg: require("../../icons/full-multi.svg"),
        active: multiMeasureMode
      });
    }

    icons.push({
      name: "search",
      ref: "search",
      onClick: this.toggleSearch,
      svg: require("../../icons/full-search.svg"),
      active: showSearch
    });

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
    </SearchableTile>;
  }
}
