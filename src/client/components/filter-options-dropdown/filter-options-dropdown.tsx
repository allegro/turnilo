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
import { FilterMode } from "../../../common/models/filter/filter";
import { STRINGS } from "../../config/constants";
import { CheckboxType } from "../checkbox/checkbox";
import { Dropdown } from "../dropdown/dropdown";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./filter-options-dropdown.scss";

export interface FilterOption {
  label: string;
  value: FilterMode;
  svg: string;
  checkType?: CheckboxType;
}

const FILTER_OPTIONS: FilterOption[] = [
  {
    label: STRINGS.include,
    value: FilterMode.INCLUDE,
    svg: require("../../icons/filter-include.svg"),
    checkType: "check"
  },
  {
    label: STRINGS.exclude,
    value: FilterMode.EXCLUDE,
    svg: require("../../icons/filter-exclude.svg"),
    checkType: "cross"
  },
  {
    label: STRINGS.contains,
    value: FilterMode.CONTAINS,
    svg: require("../../icons/filter-contains.svg")
  },
  {
    label: STRINGS.regex,
    value: FilterMode.REGEX,
    svg: require("../../icons/filter-regex.svg")
  }
];

export interface FilterOptionsDropdownProps {
  selectedOption: FilterMode;
  onSelectOption: (o: FilterMode) => void;
  filterOptions?: FilterOption[];
}

export class FilterOptionsDropdown extends React.Component<FilterOptionsDropdownProps> {
  static getFilterOptions(...filterTypes: string[]) {
    return FILTER_OPTIONS.filter(option => filterTypes.indexOf(option.value) !== -1);
  }

  onSelectOption = (option: FilterOption) => {
    this.props.onSelectOption(option.value);
  };

  renderFilterOption = (option: FilterOption) => {
    return <span className="filter-option">
      <SvgIcon className="icon" svg={option.svg} />
      <span className="option-label">{option.label}</span>
    </span>;
  };

  render() {
    const { selectedOption, filterOptions = FILTER_OPTIONS } = this.props;
    const selectedItem = filterOptions.find(({ value }) => value === selectedOption) || filterOptions[0];

    return <div className="filter-options-dropdown">
      <Dropdown<FilterOption>
        menuClassName="filter-options"
        items={filterOptions}
        selectedItem={selectedItem}
        equal={(a, b) => a.value === b.value}
        keyItem={d => d.value}
        renderItem={this.renderFilterOption}
        renderSelectedItem={d => <SvgIcon className="icon" svg={d.svg} />}
        onSelect={this.onSelectOption}
      />
    </div>;
  }
}
