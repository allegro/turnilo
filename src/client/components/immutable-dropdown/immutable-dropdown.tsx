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

require('./immutable-dropdown.css');

import { ImmutableUtils } from '../../../common/utils/index';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataCube, Filter, Dimension, Measure, ListItem } from '../../../common/models/index';
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
  onChange: (newItem: any, isValid: boolean, path: string) => void;
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

  static simpleGenerator(instance: any, changeFn: (newItem: any, isValid: boolean, path: string) => void) {
    return (name: string, items: ListItem[]) => {
      let MyDropDown = ImmutableDropdown.specialize<ListItem>();

      return <MyDropDown
        items={items}
        instance={instance}
        path={name}
        equal={(a: ListItem, b: ListItem) => a.value === b.value}
        renderItem={(a: ListItem) => a.label}
        keyItem={(a: ListItem) => a.value || 'default_value'}
        onChange={changeFn}
      />;
    };
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
