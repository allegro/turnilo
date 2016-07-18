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

require('./nav-logo.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataCube, Filter, Dimension, Measure } from '../../../common/models/index';
import { SvgIcon } from '../svg-icon/svg-icon';

export interface NavLogoProps extends React.Props<any> {
  onClick?: React.MouseEventHandler;
  customLogoSvg?: string;
}

export interface NavLogoState {
}

export class NavLogo extends React.Component<NavLogoProps, NavLogoState> {

  constructor() {
    super();

  }

  render() {
    const { onClick, customLogoSvg } = this.props;
    const svg = customLogoSvg || require('../../icons/pivot-logo.svg');

    return <div className="nav-logo" onClick={onClick}>
      <div className="logo">
        <SvgIcon svg={svg}/>
      </div>
    </div>;
  }
}
