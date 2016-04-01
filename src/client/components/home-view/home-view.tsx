require('./home-view.css');

import * as React from 'react';
import { Stage, DataSource, User } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { HomeHeaderBar } from '../home-header-bar/home-header-bar';
import { List } from 'immutable';
import { Fn } from "../../../common/utils/general/general";
import { NavLogo } from '../nav-logo/nav-logo';
import { NavList } from '../nav-list/nav-list';

export interface HomeViewProps extends React.Props<any> {
  dataSources?: List<DataSource>;
  user?: User;
  onNavClick?: Fn;
  onOpenAbout: Fn;
}

export interface HomeViewState {
}

export class HomeView extends React.Component< HomeViewProps, HomeViewState> {

  render() {
    const { user, dataSources, onNavClick, onOpenAbout } = this.props;

    var navLinks = dataSources.toArray().map(ds => {
      return {
        name: ds.name,
        title: ds.title,
        href: '#' + ds.name
      };
    });

    var infoAndFeedback = [{
      name: 'info',
      title: STRINGS.infoAndFeedback,
      onClick: onOpenAbout
    }];

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
              navLinks={infoAndFeedback}
            />
          </div>
        </div>
      </div>
    </div>;
  }
}
