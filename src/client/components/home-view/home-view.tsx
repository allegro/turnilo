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
  dataSources?: List<DataSource>;
  user?: User;
  onNavClick?: Function;
}

export interface HomeViewState {
}

export class HomeView extends React.Component< HomeViewProps, HomeViewState> {

  render() {
    const { user, dataSources, onNavClick } = this.props;

    var navLinks = dataSources.toArray().map(ds => {
      return {
        name: ds.name,
        title: ds.title,
        href: '#' + ds.name
      };
    });

    return <div className="home-view">
      <HomeHeaderBar
        user={user}
        onNavClick={onNavClick}
      />
      <div className="container">
        <div className="wrapper">
          <div className="home">
            <NavLogo/>
            <NavList
              title="Data Cubes"
              navLinks={navLinks}
              iconSvg={require('../../icons/full-cube.svg')}
            />
            <NavList
              navLinks={ADDITIONAL_LINKS}
            />
          </div>
        </div>
      </div>
    </div>;
  }
}
