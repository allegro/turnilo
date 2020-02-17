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
import { Clicker } from "../../../../common/models/clicker/clicker";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { DragPosition } from "../../../../common/models/drag-position/drag-position";
import { Essence } from "../../../../common/models/essence/essence";
import { FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Filter, FilterMode } from "../../../../common/models/filter/filter";
import { Stage } from "../../../../common/models/stage/stage";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../../common/utils/general/general";
import { BubbleMenu } from "../../bubble-menu/bubble-menu";
import { FilterOption, FilterOptionsDropdown } from "../../filter-options-dropdown/filter-options-dropdown";
import { PreviewStringFilterMenu } from "../../preview-string-filter-menu/preview-string-filter-menu";
import { SelectableStringFilterMenu } from "../../selectable-string-filter-menu/selectable-string-filter-menu";
import "./string-filter-menu.scss";

export interface StringFilterMenuProps {
  clicker: Clicker;
  dimension: Dimension;
  essence: Essence;
  timekeeper: Timekeeper;
  changePosition: DragPosition;
  onClose: Fn;
  containerStage?: Stage;
  openOn: Element;
  inside?: Element;
}

export interface StringFilterMenuState {
  filterMode?: FilterMode;
}

export class StringFilterMenu extends React.Component<StringFilterMenuProps, StringFilterMenuState> {

  private initialFilterMode = (): FilterMode => {
    const { essence: { filter }, dimension } = this.props;
    const filterMode = filter.getModeForDimension(dimension);
    return filterMode || FilterMode.INCLUDE;
  };

  state: StringFilterMenuState = { filterMode: this.initialFilterMode() };

  onSelectFilterOption = (filterMode: FilterMode) => this.setState({ filterMode });

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
  };

  getFilterOptions() {
    const { dimension } = this.props;
    const dimensionKind = dimension.kind;

    let filterOptions: FilterOption[] = FilterOptionsDropdown.getFilterOptions(FilterMode.INCLUDE, FilterMode.EXCLUDE);
    if (dimensionKind !== "boolean") filterOptions = filterOptions.concat(FilterOptionsDropdown.getFilterOptions(FilterMode.REGEX, FilterMode.CONTAINS));

    return filterOptions;
  }

  renderFilterControls(): JSX.Element {
    const { dimension, clicker, essence, timekeeper, onClose } = this.props;
    const { filterMode } = this.state;
    const onClauseChange = this.updateFilter;
    const props = { dimension, clicker, essence, timekeeper, onClose, onClauseChange };
    switch (filterMode) {
      case FilterMode.EXCLUDE:
      case FilterMode.INCLUDE:
        const selectableProps = { ...props, filterMode };
        return <SelectableStringFilterMenu {...selectableProps} />;
      case FilterMode.REGEX:
      case FilterMode.CONTAINS:
        const previewProps = { ...props, filterMode };
        return <PreviewStringFilterMenu key={filterMode} {...previewProps} />;
    }
  }

  render() {
    const { dimension, onClose, containerStage, openOn, inside } = this.props;
    const { filterMode } = this.state;
    if (!dimension) return null;

    return <BubbleMenu
      className="string-filter-menu"
      direction="down"
      containerStage={containerStage}
      stage={Stage.fromSize(300, 410)}
      openOn={openOn}
      onClose={onClose}
      inside={inside}
    >
      <div className="string-filter-content">
        <FilterOptionsDropdown
          selectedOption={filterMode}
          onSelectOption={this.onSelectFilterOption}
          filterOptions={this.getFilterOptions()}
        />
        {this.renderFilterControls()}
      </div>
    </BubbleMenu>;
  }
}
