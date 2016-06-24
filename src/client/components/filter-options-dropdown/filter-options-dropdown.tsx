require('./filter-options-dropdown.css');

import * as React from 'react';
import { STRINGS } from '../../config/constants';

import { Filter, FilterMode } from '../../../common/models/index';

import { Dropdown, DropdownProps } from "../dropdown/dropdown";
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

    var selectedItem = FILTER_OPTIONS.filter(o => o.value === selectedOption)[0] || FILTER_OPTIONS[0];

    var dropdown = React.createElement(Dropdown, {
      className: 'filter-options',
      items: FILTER_OPTIONS,
      selectedItem: selectedItem,
      equal: (a, b) => a.value === b.value,
      keyItem: (d) => d.value,
      renderItem: this.renderFilterOption.bind(this),
      renderSelectedItem: (d) => <SvgIcon className="icon" svg={d.svg}/>,
      onSelect: this.onSelectOption.bind(this)
    } as DropdownProps<FilterOption>);

    return <div className="filter-options-dropdown">{dropdown}</div>;
  }
}
