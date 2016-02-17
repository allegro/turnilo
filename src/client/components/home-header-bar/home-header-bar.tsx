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
  onNavClick: React.MouseEventHandler;
}

export interface HomeHeaderBarState {
}

export class HomeHeaderBar extends React.Component< HomeHeaderBarProps, HomeHeaderBarState> {
  handleSettings() {}


  render() {
    var { onNavClick } = this.props;
    var gitHubIcon : JSX.Element = <a className="icon-button github" href="https://github.com/implydata/pivot" target="_blank">
      <SvgIcon className="github-icon" svg={require('../../icons/github.svg')}/>
    </a>;

    return <header className="home-header-bar">
      <div className="burger-bar" onClick={onNavClick}>
        <div className="menu-icon">
          <SvgIcon svg={require('../../icons/menu.svg')}/>
        </div>
        <div className="title">Home</div>
      </div>
      <ul className="right-bar">
        <li className="icon-button" onClick={this.handleSettings.bind(this)}>
          <SvgIcon className="not-implemented" svg={require('../../icons/full-settings.svg')}/>
        </li>
        <li className="icon-button">
          <a href="https://groups.google.com/forum/#!forum/imply-user-group" target="_blank">
            <SvgIcon className="not-implemented" svg={require('../../icons/full-user.svg')}/>
          </a>
        </li>
        <a className="icon-button help" href="https://groups.google.com/forum/#!forum/imply-user-group" target="_blank">
          <SvgIcon className="help-icon" svg={require('../../icons/help.svg')}/>
        </a>
        {gitHubIcon}
      </ul>
    </header>;
  }
}
