'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Clicker, Essence, Filter, Dimension, Measure } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface MenuActionBarProps {
  clicker: Clicker;
  essence: Essence;
  dimension: Dimension;
}

interface MenuActionBarState {
}

export class MenuActionBar extends React.Component<MenuActionBarProps, MenuActionBarState> {
  constructor() {
    super();
    // this.state = {};

  }

  onFilter(): void {

  }

  onSplit(): void {

  }

  onSubsplit(): void {

  }

  onPin(): void {

  }

  render() {
    return JSX(`
      <div className="menu-action-bar">
        <div className="filter action" onClick={this.onFilter.bind(this)}>
          <Icon name="split-replace"/>
          <div className="action-label">Filter</div>
        </div>
        <div className="split action" onClick={this.onSplit.bind(this)}>
          <Icon name="split-replace"/>
          <div className="action-label">Split</div>
        </div>
        <div className="subsplit action" onClick={this.onSubsplit.bind(this)}>
          <Icon name="split-replace"/>
          <div className="action-label">Subsplit</div>
        </div>
        <div className="pin action"  onClick={this.onPin.bind(this)}>
          <Icon name="split-replace"/>
          <div className="action-label">Pin</div>
        </div>
      </div>
    `);
  }
}
