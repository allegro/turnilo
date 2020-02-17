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
import { ListItem } from "../../../common/models/list-item/list-item";
import { ImmutableUtils } from "../../../common/utils/immutable-utils/immutable-utils";
import { ChangeFn } from "../../utils/immutable-form-delegate/immutable-form-delegate";
import { Dropdown } from "../dropdown/dropdown";
import "./immutable-dropdown.scss";

export interface ImmutableDropdownProps<T> {
  instance: any;
  path: string;
  label?: string;

  items: T[];
  equal: (a: T, b: T) => boolean;
  renderItem: (a: T) => string;
  keyItem: (a: T) => any;
  onChange: ChangeFn;
}

export interface ImmutableDropdownState {
}

export class ImmutableDropdown<T> extends React.Component<ImmutableDropdownProps<T>, ImmutableDropdownState> {

  static simpleGenerator(instance: any, changeFn: ChangeFn) {
    return (name: string, items: ListItem[]) => {
      return <ImmutableDropdown<ListItem>
        items={items}
        instance={instance}
        path={name}
        equal={(a: ListItem, b: ListItem) => a.value === b.value}
        renderItem={(a: ListItem) => a ? a.label : ""}
        keyItem={(a: ListItem) => a.value || "default_value"}
        onChange={changeFn}
      />;
    };
  }

  onChange = (newSelectedItem: T) => {
    const { instance, path, onChange, keyItem } = this.props;

    onChange(
      ImmutableUtils.setProperty(instance, path, keyItem(newSelectedItem)),
      true,
      path,
      undefined
    );
  };

  render() {
    const { label, items, equal, renderItem, keyItem, instance, path } = this.props;
    const selectedValue = ImmutableUtils.getProperty(instance, path);

    const selectedItem: T = items.filter(item => keyItem(item) === selectedValue)[0] || items[0];

    return <Dropdown<T>
      className="immutable-dropdown input"
      label={label}
      items={items}
      selectedItem={selectedItem}
      equal={equal}
      renderItem={renderItem}
      keyItem={keyItem}
      onSelect={this.onChange}
    />;
  }
}
