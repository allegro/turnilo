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
import * as ReactDOM from "react-dom";
import { classNames, escapeKey, isInside, JSXNode } from "../../utils/dom/dom";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./dropdown.scss";

function simpleEqual(item1: any, item2: any): boolean {
  return item1 === item2;
}

export interface DropdownProps<T> {
  label?: string;
  items: T[];
  className?: string;
  menuClassName?: string;
  selectedItem?: T;
  equal?: (item1: T, item2: T) => boolean;
  renderItem?: (item: T) => JSXNode;
  renderSelectedItem?: (item: T) => JSXNode;
  keyItem?: (item: T) => string;
  onSelect?: (item: T) => void;
  direction?: string;
}

export interface DropdownState {
  open: boolean;
}

export class Dropdown<T> extends React.Component<DropdownProps<T>, DropdownState> {
  state: DropdownState = {
    open: false
  };

  componentDidMount() {
    window.addEventListener("mousedown", this.globalMouseDownListener);
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.globalMouseDownListener);
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  onClick = () => {
    this.setState(({ open }) => ({ open: !open }));
  };

  globalMouseDownListener = (e: MouseEvent) => {
    const { open } = this.state;
    if (!open) return;

    const myElement = ReactDOM.findDOMNode(this) as Element;
    if (!myElement) return;
    const target = e.target as Element;

    if (isInside(target, myElement)) return;
    this.setState({ open: false });
  };

  globalKeyDownListener = (e: KeyboardEvent) => {
    if (!escapeKey(e)) return;
    const { open } = this.state;
    if (!open) return;
    this.setState({ open: false });
  };

  renderMenu() {
    const { items, renderItem = String, keyItem = renderItem, selectedItem, equal = simpleEqual, onSelect, menuClassName } = this.props;
    if (!items || !items.length) return null;
    const itemElements = items.map(item => {
      return <div
        className={classNames("dropdown-item", { selected: selectedItem && equal(item, selectedItem) })}
        key={keyItem(item) as string}
        onClick={() => onSelect(item)}>
        {renderItem(item)}
      </div>;
    });

    return <div className={classNames("dropdown-menu", menuClassName)}>
      {itemElements}
    </div>;
  }

  render() {
    const { label, renderItem = String, selectedItem, direction = "down", renderSelectedItem = renderItem, className } = this.props;
    const { open } = this.state;

    const labelElement = label && <div className="dropdown-label">{label}</div>;

    return <div className={classNames("dropdown", direction, className)} onClick={this.onClick}>
      {labelElement}
      <div className={classNames("selected-item", { active: open })}>{renderSelectedItem(selectedItem)}
        <SvgIcon className="caret-icon" svg={require("../../icons/dropdown-caret.svg")} />
      </div>
      {open ? this.renderMenu() : null}
    </div>;
  }
}
