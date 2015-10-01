'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure, TimePreset } from '../../../common/models/index';
// import { ... } from '../../config/constants';
// import { SomeComp } from '../some-comp/some-comp';

function simpleEqual(item1: any, item2: any): boolean {
  return item1 === item2;
}

export interface DropdownProps<T> {
  label?: string;
  items: T[];
  selectedItem?: T;
  equal?: (item1: T, item2: T) => boolean;
  renderItem?: (item: T) => string;
  keyItem?: (item: T) => string;
  onSelect?: Function;
  direction?: string;
}

export interface DropdownState {
  open: boolean;
}

export class Dropdown<T> extends React.Component<DropdownProps<T>, DropdownState> {

  constructor() {
    super();
    this.state = {
      open: false
    };

  }

  onClick() {
    var { open } = this.state;
    this.setState({
      open: !open
    });
  }

  selectItem(item: T) {
    var { onSelect } = this.props;
    if (onSelect) onSelect(item);
  }

  renderMenu() {
    var { items, renderItem, keyItem, selectedItem, equal } = this.props;
    if (!items || !items.length) return null;
    if (!renderItem) renderItem = String;
    if (!keyItem) keyItem = renderItem;
    if (!equal) equal = simpleEqual;
    var itemElements = items.map((item) => {
      return JSX(`
        <div
          className={'dropdown-item' + (equal(item, selectedItem) ? ' selected' : '')}
          key={keyItem(item)}
          onClick={this.selectItem.bind(this, item)}
        >
          {renderItem(item)}
        </div>
      `);
    });

    return JSX(`
      <div className="dropdown-menu">
        {itemElements}
      </div>
    `);
  }

  render() {
    var { label, renderItem, selectedItem, direction } = this.props;
    var { open } = this.state;
    if (!renderItem) renderItem = String;
    if (!direction) direction = 'down';

    var labelElement: React.DOMElement<any> = null;
    if (label) {
      labelElement = JSX(`<div className="dropdown-label">{label}</div>`);
    }

    return JSX(`
      <div className={'dropdown ' + direction} onClick={this.onClick.bind(this)}>
        {labelElement}
        <div className="selected-item">{renderItem(selectedItem)}</div>
        <Icon className="caret-icon" name="dropdown-caret"/>
        { open ? this.renderMenu() : null }
      </div>
    `);
  }
}
