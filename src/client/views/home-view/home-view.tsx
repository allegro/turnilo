require('./home-view.css');

import * as React from 'react';
import { Stage, DataSource, User, Customization } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { Fn } from '../../../common/utils/general/general';

import { HomeHeaderBar } from '../../components/home-header-bar/home-header-bar';
import { GoldenCenter } from '../../components/golden-center/golden-center';
import { NavLogo } from '../../components/nav-logo/nav-logo';
import { NavList } from '../../components/nav-list/nav-list';

export interface HomeViewProps extends React.Props<any> {
  dataSources?: DataSource[];
  user?: User;
  onNavClick?: Fn;
  onOpenAbout: Fn;
  customization?: Customization;
}

export interface HomeViewState {
}

export class HomeView extends React.Component< HomeViewProps, HomeViewState> {

  render() {
    const { user, dataSources, onNavClick, onOpenAbout, customization } = this.props;

    var navLinks = dataSources.map(ds => {
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
        customization={customization}
        title={STRINGS.home}
      />
      <div className="container">
        <GoldenCenter>
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
        </GoldenCenter>
      </div>
    </div>;
  }
}
