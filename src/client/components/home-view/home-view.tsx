require('./home-view.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Stage, Essence, DataSource, Filter, Dimension, Measure, User } from '../../../common/models/index';
import { ADDITIONAL_LINKS } from '../../config/constants';
import { SvgIcon } from '../svg-icon/svg-icon';
import { HomeHeaderBar } from '../home-header-bar/home-header-bar';
import { List } from 'immutable';
import { NavLogo } from '../nav-logo/nav-logo';
import { NavList } from '../nav-list/nav-list';

export interface HomeViewProps extends React.Props<any> {
  dataCubes?: List<DataSource>;
  user?: User;
  selectDataCube?: Function;
  onNavClick?: Function;
}

export interface HomeViewState {
}

export class HomeView extends React.Component< HomeViewProps, HomeViewState> {
  selectLink(selected: any) {
    if (selected.target) {
      window.open(selected.target);
      return false;
    } else {
      return; // state change for application to handle
    }
  };

  selectDataCube(dataCube: DataSource) {
    this.props.selectDataCube(dataCube);
  }

  render() {
    const { user, onNavClick } = this.props;

    return <div className="home-view">
      <HomeHeaderBar
        user={user}
        onNavClick={onNavClick}
      />
      <div className="container">
        <div className="home">
          <NavLogo/>
          <NavList
            title="Data Cubes"
            className="items"
            navItems={this.props.dataCubes}
            onSelect={this.selectDataCube.bind(this)}
            icon="'../../full-cube.svg'"
          />
          <NavList
            className="items"
            navItems={ADDITIONAL_LINKS}
            onSelect={this.selectLink.bind(this)}
          />
        </div>
      </div>
    </div>;
  }
}
