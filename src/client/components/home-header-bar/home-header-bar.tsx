'use strict';
require('./home-header-bar.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
// import { ... } from '../../config/constants';
import { SvgIcon } from '../svg-icon/svg-icon';

// I am: import { HomeHeaderBar } from '../home-header-bar/home-header-bar';

export interface HomeHeaderBarProps extends React.Props<any> {
}

export interface HomeHeaderBarState {
}

export class HomeHeaderBar extends React.Component< HomeHeaderBarProps, HomeHeaderBarState> {
  handleSettings() {}

  render() {
    return <header className="home-header-bar">
      <div className="burger-bar">
        <div className="title">Home</div>
      </div>
      <ul className="right-bar">
        <li className="icon-button" onClick={this.handleSettings.bind(this)}>
          <SvgIcon className="not-implemented" svg={require('../../icons/full-settings.svg')}/>
        </li>
        <li className="icon-button">
          <a href="https://groups.google.com/forum/#!forum/imply-user-group" target="_blank">
            <SvgIcon svg={require('../../icons/full-user.svg')}/>
          </a>
        </li>
      </ul>
    </header>;
  }
}
