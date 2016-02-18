'use strict';
require('./menu-header.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SvgIcon } from '../svg-icon/svg-icon';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Filter, Dimension, Measure } from '../../../common/models/index';

export interface MenuHeaderProps extends React.Props<any> {
  //clicker: Clicker;
  dimension: Dimension;
  onSearchClick: React.MouseEventHandler;
}

export interface MenuHeaderState {
}

export class MenuHeader extends React.Component<MenuHeaderProps, MenuHeaderState> {

  constructor() {
    super();
    // this.state = {};

  }

  render() {
    var { dimension, onSearchClick } = this.props;

    var searchBar: JSX.Element = null;
    if (onSearchClick) {
      searchBar = <div className="search" onClick={onSearchClick}>
        <SvgIcon svg={require('../../icons/loupe.svg')}/>
      </div>;
    }

    return <div className="menu-header">
      <div className="menu-title">{dimension.title}</div>
      {searchBar}
    </div>;
  }
}
