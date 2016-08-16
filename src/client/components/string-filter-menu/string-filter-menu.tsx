/*
 * Copyright 2015-2016 Imply Data, Inc.
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

require('./string-filter-menu.css');

import * as React from 'react';
import { Fn } from '../../../common/utils/general/general';
import { Stage, Clicker, Essence, Filter, FilterMode, Dimension, DragPosition, FilterClause } from '../../../common/models/index';

import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { PreviewStringFilterMenu } from '../preview-string-filter-menu/preview-string-filter-menu';
import { SelectableStringFilterMenu  } from '../selectable-string-filter-menu/selectable-string-filter-menu';
import { ClearableInput } from "../clearable-input/clearable-input";
import { FilterOptionsDropdown, FilterOption } from "../filter-options-dropdown/filter-options-dropdown";

export interface StringFilterMenuProps extends React.Props<any> {
  clicker: Clicker;
  dimension: Dimension;
  essence: Essence;
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

  constructor() {
    super();
    this.state = {
      filterMode: null,
      searchText: null
    };
  }

  componentWillMount() {
    var { essence, dimension } = this.props;
    var { colors } = essence;

    var filterMode = essence.filter.getModeForDimension(dimension);
    if (filterMode && !this.state.filterMode) {
      this.setState({filterMode});
    } else if (colors) {
      this.setState({filterMode: Filter.INCLUDED});
    }
  }

  onSelectFilterOption(filterMode: FilterMode) {
    this.setState({filterMode});
  }

  updateSearchText(searchText: string) {
    this.setState({searchText});
  }

  updateFilter(clause: FilterClause): Filter {
    const { essence, dimension, changePosition } = this.props;
    var { filter } = essence;

    if (!clause) return filter.remove(dimension.expression);
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
    const { dimension } = this.props;
    const dimensionKind = dimension.kind;

    var filterOptions: FilterOption[] = FilterOptionsDropdown.getFilterOptions(Filter.INCLUDED, Filter.EXCLUDED);
    if (dimensionKind !== 'boolean') filterOptions = filterOptions.concat(FilterOptionsDropdown.getFilterOptions(Filter.MATCH));

    return filterOptions;
  }

  renderMenuControls() {
    const { filterMode, searchText } = this.state;

    return <div className="string-filter-menu-controls">
      <div className="side-by-side">
        <FilterOptionsDropdown
          selectedOption={filterMode}
          onSelectOption={this.onSelectFilterOption.bind(this)}
          filterOptions={this.getFilterOptions()}
        />
        <div className="search-box">
          <ClearableInput
            placeholder="Search"
            focusOnMount={true}
            value={searchText}
            onChange={this.updateSearchText.bind(this)}
          />
        </div>
      </div>
    </div>;
  }

  render() {
    const { dimension, clicker, essence, onClose, containerStage, openOn, inside } = this.props;
    const { filterMode, searchText } = this.state;
    if (!dimension) return null;

    var menuSize: Stage = null;
    var menuCont: JSX.Element = null;

    if (filterMode === Filter.MATCH) {
      menuSize = Stage.fromSize(350, 410);
      menuCont = <PreviewStringFilterMenu
          dimension={dimension}
          clicker={clicker}
          essence={essence}
          onClose={onClose}
          searchText={searchText}
          filterMode={filterMode}
          onClauseChange={this.updateFilter.bind(this)}
        />;
    } else {
      menuSize = Stage.fromSize(250, 410);
      menuCont = <SelectableStringFilterMenu
          dimension={dimension}
          clicker={clicker}
          essence={essence}
          onClose={onClose}
          searchText={searchText}
          filterMode={filterMode}
          onClauseChange={this.updateFilter.bind(this)}
      />;
    }

    return <BubbleMenu
      className="string-filter-menu"
      direction="down"
      containerStage={containerStage}
      stage={menuSize}
      openOn={openOn}
      onClose={onClose}
      inside={inside}
    >
      {this.renderMenuControls()}
      {menuCont}
    </BubbleMenu>;
  }
}
