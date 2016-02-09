'use strict';
require('./home-view.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
// import { ... } from '../../config/constants';
import { SvgIcon } from '../svg-icon/svg-icon';
import { List } from 'immutable';

import { NavList } from '../nav-list/nav-list';
// I am: import { HomeView } from '../home-view/home-view';

export interface HomeViewProps extends React.Props<any> {
  dataCubes?: List<DataSource>;
  selectDataCube?: Function;
}

export interface HomeViewState {
}

export class HomeView extends React.Component< HomeViewProps, HomeViewState> {

  getAdditionalLinks() {
    return List([
      { title: 'Settings', name: 'settings' },
      { title: 'Info & Feedback', name: 'info & feedback', target: 'https://groups.google.com/forum/#!forum/imply-user-group'}
    ]);
  }

  selectLink(selected: any) {
    if (selected.target) {
      window.open(selected.target);
      return false;
    } else {
      // state change for application to handle
    }

  };

  selectDataCube(dataCube: DataSource) {
    this.props.selectDataCube(dataCube);
  }

  render() {
    return <div className="home-view">
      <div className="collection">
        <div className="nav home">
          <div className="logo-cont">
            <div className="logo">
              <SvgIcon svg={require('../../icons/pivot-logo.svg')}/>
            </div>
          </div>
          <NavList
            title="Data Cubes"
            className="items"
            navItems={this.props.dataCubes}
            onSelect={this.selectDataCube.bind(this)}
            icon="'../../full-cube.svg'"
          />
          <NavList
            className="items"
            navItems={this.getAdditionalLinks()}
            onSelect={this.selectLink.bind(this)}
          />
        </div>
      </div>
    </div>;
  }
}
