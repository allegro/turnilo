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
import * as ReactDOM from "react-dom";
import { JSXNode } from "../../../common/utils";
import { classNames, escapeKey, isInside } from "../../utils/dom/dom";
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

  constructor(props: DropdownProps<T>) {
    super(props);
    this.state = {
      open: false
    };

    this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentDidMount() {
    window.addEventListener("mousedown", this.globalMouseDownListener);
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.globalMouseDownListener);
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  onClick() {
    var { open } = this.state;
    this.setState({ open: !open });
  }

  globalMouseDownListener(e: MouseEvent) {
    var { open } = this.state;
    if (!open) return;

    var myElement = ReactDOM.findDOMNode(this);
    if (!myElement) return;
    var target = e.target as Element;

    if (isInside(target, myElement)) return;
    this.setState({ open: false });
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (!escapeKey(e)) return;
    var { open } = this.state;
    if (!open) return;
    this.setState({ open: false });
  }

  renderMenu() {
    var { items, renderItem, keyItem, selectedItem, equal, onSelect, menuClassName } = this.props;
    if (!items || !items.length) return null;
    if (!renderItem) renderItem = String;
    if (!keyItem) keyItem = renderItem as (item: T) => string;
    if (!equal) equal = simpleEqual;
    var itemElements = items.map(item => {
      return <div
        className={classNames("dropdown-item", equal(item, selectedItem) ? "selected" : null)}
        key={keyItem(item)}
        onClick={() => onSelect(item)}
      >
        {renderItem(item)}
      </div>;
    });

    return <div className={classNames("dropdown-menu", menuClassName)}>
      {itemElements}
    </div>;
  }

  render() {
    var { label, renderItem, selectedItem, direction, renderSelectedItem, className } = this.props;
    var { open } = this.state;
    if (!renderItem) renderItem = String;
    if (!direction) direction = "down";
    if (!renderSelectedItem) renderSelectedItem = renderItem as (item: T) => string;

    var labelElement: JSX.Element = null;
    if (label) {
      labelElement = <div className="dropdown-label">{label}</div>;
    }

    return <div className={classNames("dropdown", direction, className)} onClick={this.onClick.bind(this)}>
      {labelElement}
      <div className={classNames("selected-item", { active: open })}>{renderSelectedItem(selectedItem)}
        <SvgIcon className="caret-icon" svg={require("../../icons/dropdown-caret.svg")} />
      </div>
      {open ? this.renderMenu() : null}
    </div>;
  }
}
