'use strict';

import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Clicker, Essence, Filter, Dimension, Measure } from '../../models/index';

interface MenuHeaderProps {
  //clicker: Clicker;
  dimension: Dimension;
  onSearchClick: Function;
}

interface MenuHeaderState {
}

export class MenuHeader extends React.Component<MenuHeaderProps, MenuHeaderState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { dimension, onSearchClick } = this.props;

    var searchBar: React.DOMElement<any> = null;
    if (onSearchClick) {
      searchBar = JSX(`
        <div className="search" onClick={onSearchClick}>
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
