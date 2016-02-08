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
  public mounted: boolean;

  constructor() {
    super();
    // this.state = {};

  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps: HomeHeaderBarProps) {

  }

  handleHelp() {}


  render() {
    return <header className="home-header-bar">
      <div className="burger-bar">
        <div className="title">Home</div>
      </div>
      <div className="right-bar">
        <a className="icon-button" onClick={this.handleHelp.bind(this)}>
          <SvgIcon svg={require('../../icons/full-settings.svg')}/>
        </a>
        <a className="icon-button" href="https://groups.google.com/forum/#!forum/imply-user-group" target="_blank">
          <SvgIcon svg={require('../../icons/full-user.svg')}/>
        </a>
      </div>
    </header>;
  }
}
