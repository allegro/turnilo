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
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Essence } from "../../../common/models/essence/essence";
import { FilterClause, StringFilterAction, StringFilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Filter, FilterMode } from "../../../common/models/filter/filter";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../common/utils/general/general";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { ClearableInput } from "../clearable-input/clearable-input";
import { FilterOption, FilterOptionsDropdown } from "../filter-options-dropdown/filter-options-dropdown";
import { PreviewStringFilterMenu } from "../preview-string-filter-menu/preview-string-filter-menu";
import { SelectableStringFilterMenu } from "../selectable-string-filter-menu/selectable-string-filter-menu";
import "./string-filter-menu.scss";

export interface StringFilterMenuProps {
  clicker: Clicker;
  dimension: Dimension;
  essence: Essence;
  timekeeper: Timekeeper;
  changePosition: DragPosition;
  onClose: Fn;

  containerStage: Stage;
  openOn: Element;
  inside: Element;
}

export interface StringFilterMenuState {
  filterMode?: FilterMode;
  searchText?: string;
}

export class StringFilterMenu extends React.Component<StringFilterMenuProps, StringFilterMenuState> {
  public mounted: boolean;

  constructor(props: StringFilterMenuProps) {
    super(props);
    this.state = {
      filterMode: null,
      searchText: ""
    };
  }

  componentWillMount() {
    const { essence: { colors, filter }, dimension } = this.props;

    const filterMode = filter.getModeForDimension(dimension);
    if (filterMode && !this.state.filterMode) {
      const searchText = this.getInitialSearchText();
      this.setState({ filterMode, searchText });
    } else if (colors) {
      this.setState({ filterMode: FilterMode.INCLUDE });
    }
  }

  getInitialSearchText(): string {
    const { essence, dimension } = this.props;
    const filterClause = essence.filter.getClauseForDimension(dimension);
    if (!(filterClause instanceof StringFilterClause)) throw new Error(`Expected StringFilterClause. Got ${filterClause}`);
    if (filterClause.action === StringFilterAction.IN) return "";
    return filterClause.values.first();
  }

  onSelectFilterOption = (filterMode: FilterMode) => {
    this.setState({ filterMode });
  }

  updateSearchText = (searchText: string) => {
    this.setState({ searchText });
  }

  updateFilter: (clause: FilterClause) => Filter = clause => {
    const { essence, dimension, changePosition } = this.props;
    const { filter } = essence;

    if (!clause) return filter.removeClause(dimension.name);
    if (changePosition) {
      if (changePosition.isInsert()) {
        return filter.insertByIndex(changePosition.insert, clause);
      } else {
        return filter.replaceByIndex(changePosition.replace, clause);
      }
    } else {
      return filter.setClause(clause);
    }
  }

  getFilterOptions() {
    const { dimension: { kind } } = this.props;

    let filterOptions: FilterOption[] = FilterOptionsDropdown.getFilterOptions(FilterMode.INCLUDE, FilterMode.EXCLUDE);
    if (kind !== "boolean") filterOptions = filterOptions.concat(FilterOptionsDropdown.getFilterOptions(FilterMode.REGEX, FilterMode.CONTAINS));

    return filterOptions;
  }

  renderMenuControls() {
    const { filterMode, searchText } = this.state;

    return <div className="string-filter-menu-controls">
      <div className="side-by-side">
        <FilterOptionsDropdown
          selectedOption={filterMode}
          onSelectOption={this.onSelectFilterOption}
          filterOptions={this.getFilterOptions()}
        />
        <div className="search-box">
          <ClearableInput
            placeholder="Search"
            focusOnMount={true}
            value={searchText}
            onChange={this.updateSearchText}
          />
        </div>
      </div>
    </div>;
  }

  renderMenu(): { stage: Stage, menu: JSX.Element } {
    const { dimension, clicker, essence, timekeeper, onClose } = this.props;
    const { filterMode, searchText } = this.state;
    const props = {
      dimension,
      clicker,
      essence,
      timekeeper,
      onClose,
      searchText,
      filterMode,
      onClauseChange: this.updateFilter
    };
    if (filterMode === FilterMode.REGEX || filterMode === FilterMode.CONTAINS) {
      return { stage: Stage.fromSize(350, 410), menu: <PreviewStringFilterMenu {...props} /> };
    }
    return { stage: Stage.fromSize(250, 410), menu: <SelectableStringFilterMenu {...props} /> };
  }

  render() {
    const { dimension, onClose, containerStage, openOn, inside } = this.props;
    if (!dimension) return null;

    const { stage, menu } = this.renderMenu();

    return <BubbleMenu
      className="string-filter-menu"
      direction="down"
      containerStage={containerStage}
      stage={stage}
      openOn={openOn}
      onClose={onClose}
      inside={inside}
    >
      {this.renderMenuControls()}
      {menu}
    </BubbleMenu>;
  }
}
