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
