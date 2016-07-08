require('./immutable-dropdown.css');

import { ImmutableUtils } from '../../../common/utils/index';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
import { SvgIcon } from '../svg-icon/svg-icon';
import { Dropdown } from '../dropdown/dropdown';

export interface ImmutableDropdownProps<T> extends React.Props<any> {
  instance: any;
  path: string;
  label?: string;

  items: Array<T>;
  equal: (a: T, b: T) => boolean;
  renderItem: (a: T) => string;
  keyItem: (a: T) => any;
  onChange: (newItem: T, isValid: boolean, path: string) => void;
}

export interface ImmutableDropdownState {
}

export class ImmutableDropdown<T> extends React.Component<ImmutableDropdownProps<T>, ImmutableDropdownState> {
  // Allows usage in TSX :
  // const MyDropdown = ImmutableDropdown.specialize<MyImmutableClass>();
  // then : <MyDropdown ... />
  static specialize<U>() {
    return ImmutableDropdown as { new (): ImmutableDropdown<U>; };
  }

  constructor() {
    super();
  }

  onChange(newSelectedItem: T) {
    const { instance, path, onChange, keyItem } = this.props;

    onChange(
      ImmutableUtils.setProperty(instance, path, keyItem(newSelectedItem)),
      true,
      path
    );
  }

  render() {
    const { label, items, equal, renderItem, keyItem, instance, path } = this.props;
    const MyDropDown = Dropdown.specialize<T>();

    const selectedValue = ImmutableUtils.getProperty(instance, path);

    const selectedItem: T = items.filter((item) => keyItem(item) === selectedValue)[0] || items[0];

    return <MyDropDown
      className="immutable-dropdown input"
      label={label}
      items={items}
      selectedItem={selectedItem}
      equal={equal}
      renderItem={renderItem}
      keyItem={keyItem}
      onSelect={this.onChange.bind(this)}
    />;
  }
}
