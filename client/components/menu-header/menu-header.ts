'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Clicker, Essence, Filter, Dimension, Measure } from '../../models/index';

interface MenuHeaderProps {
  //clicker: Clicker;
  dimension: Dimension;
  onSearchToggle?: Function;
}

interface MenuHeaderState {
}

export class MenuHeader extends React.Component<MenuHeaderProps, MenuHeaderState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { dimension, onSearchToggle } = this.props;

    var searchBar: React.DOMElement<any> = null;
    if (onSearchToggle) {
      searchBar = JSX(`
        <div className="search" onClick={onSearchToggle}>
          <Icon name="loupe"/>
        </div>
      `);
    }

    return JSX(`
      <div className="menu-header">
        <div className="menu-title">{dimension.title}</div>
        {searchBar}
      </div>
    `);
  }
}
