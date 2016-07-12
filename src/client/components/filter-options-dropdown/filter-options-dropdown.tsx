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

require('./filter-options-dropdown.css');

import * as React from 'react';
import { STRINGS } from '../../config/constants';

import { Filter, FilterMode } from '../../../common/models/index';

import { Dropdown } from "../dropdown/dropdown";
import { SvgIcon } from '../svg-icon/svg-icon';
import { CheckboxType } from '../checkbox/checkbox';

export interface FilterOption {
  label: string;
  value: FilterMode;
  svg: string;
  checkType?: CheckboxType;
}

const FILTER_OPTIONS: FilterOption[] = [
  {
    label: STRINGS.include,
    value: Filter.INCLUDED,
    svg: require('../../icons/filter-include.svg'),
    checkType: 'check'
  },
  {
    label: STRINGS.exclude,
    value: Filter.EXCLUDED,
    svg: require('../../icons/filter-exclude.svg'),
    checkType: 'cross'
  }
];


export interface FilterOptionsDropdownProps extends React.Props<any> {
  selectedOption: FilterMode;
  onSelectOption: (o: FilterMode) => void;
}

export interface FilterOptionsDropdownState {
}

export class FilterOptionsDropdown extends React.Component<FilterOptionsDropdownProps, FilterOptionsDropdownState> {
  constructor() {
    super();
  }

  onSelectOption(option: FilterOption) {
    this.props.onSelectOption(option.value);
  }

  renderFilterOption(option: FilterOption) {
    return <span className="filter-option">
      <SvgIcon className="icon" svg={option.svg}/>
      <span className="option-label">{option.label}</span>
    </span>;
  }

  render() {
    var { selectedOption, onSelectOption } = this.props;
    const FilterDropdown = Dropdown.specialize<FilterOption>();

    var selectedItem = FILTER_OPTIONS.filter(o => o.value === selectedOption)[0] || FILTER_OPTIONS[0];

    return <div className="filter-options-dropdown">
      <FilterDropdown
        menuClassName="filter-options"
        items={FILTER_OPTIONS}
        selectedItem={selectedItem}
        equal={(a, b) => a.value === b.value}
        keyItem={(d) => d.value}
        renderItem={this.renderFilterOption.bind(this)}
        renderSelectedItem={(d) => <SvgIcon className="icon" svg={d.svg}/>}
        onSelect={this.onSelectOption.bind(this)}
      />
    </div>;
  }
}
