'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Clicker, Essence, Filter, Dimension, Measure, SplitCombine } from '../../../common/models/index';
// import { SomeComp } from '../some-comp/some-comp';

interface MenuActionBarProps {
  clicker: Clicker;
  essence: Essence;
  dimension: Dimension;
  onFilter: Function;
  onClose: Function;
}

interface MenuActionBarState {
}

export class MenuActionBar extends React.Component<MenuActionBarProps, MenuActionBarState> {
  constructor() {
    super();
    // this.state = {};

  }

  onFilter(): void {
    var { dimension, onFilter, onClose } = this.props;
    onFilter(dimension);
    onClose();
  }

  onSplit(): void {
    var { clicker, dimension, onClose } = this.props;
    clicker.changeSplit(SplitCombine.fromExpression(dimension.expression));
    onClose();
  }

  onSubsplit(): void {
    var { clicker, dimension, onClose } = this.props;
    clicker.addSplit(SplitCombine.fromExpression(dimension.expression));
    onClose();
  }

  onPin(): void {
    var { clicker, dimension, onClose } = this.props;
    clicker.pin(dimension);
    onClose();
  }

  render() {
    return JSX(`
      <div className="menu-action-bar">
        <div className="filter action" onClick={this.onFilter.bind(this)}>
          <Icon name="preview-filter"/>
          <div className="action-label">Filter</div>
        </div>
        <div className="split action" onClick={this.onSplit.bind(this)}>
          <Icon name="preview-split"/>
          <div className="action-label">Split</div>
        </div>
        <div className="subsplit action" onClick={this.onSubsplit.bind(this)}>
          <Icon name="preview-subsplit"/>
          <div className="action-label">Subsplit</div>
        </div>
        <div className="pin action"  onClick={this.onPin.bind(this)}>
          <Icon name="preview-pin"/>
          <div className="action-label">Pin</div>
        </div>
      </div>
    `);
  }
}
