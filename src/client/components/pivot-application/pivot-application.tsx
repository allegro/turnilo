'use strict';
require('./pivot-application.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { List } from 'immutable';
import { Clicker, DataSource, Essence } from "../../../common/models/index";

import { HeaderBar } from '../header-bar/header-bar';
import { SideDrawer, SideDrawerProps } from '../side-drawer/side-drawer';
import { CubeView } from '../cube-view/cube-view';

import { visualizations } from '../../visualizations/index';

export interface PivotApplicationProps extends React.Props<any> {
  version: string;
  dataSources: List<DataSource>;
  homeLink?: string;
  maxFilters?: number;
  maxSplits?: number;
  showLastUpdated?: boolean;
  hideGitHubIcon?: boolean;
  headerBackground?: string;
}

export interface PivotApplicationState {
  ReactCSSTransitionGroupAsync?: typeof ReactCSSTransitionGroup;
  SideDrawerAsync?: typeof SideDrawer;
  essence?: Essence;
  drawerOpen?: boolean;
}

export class PivotApplication extends React.Component<PivotApplicationProps, PivotApplicationState> {
  private clicker: Clicker;
  private hashUpdating: boolean = false;

  constructor() {
    super();
    this.state = {
      ReactCSSTransitionGroupAsync: null,
      SideDrawerAsync: null,
      essence: null,
      drawerOpen: false
    };


    this.globalHashChangeListener = this.globalHashChangeListener.bind(this);
  }

  changeDataSource(dataSource: DataSource) {
    var { essence } = this.state;
    this.setState({ essence: essence.changeDataSource(dataSource) });
  };

  componentWillMount() {
    var { dataSources } = this.props;
    if (!dataSources.size) throw new Error('must have data sources');
    var dataSource = dataSources.first();
    var essence = this.getEssenceFromHash() || Essence.fromDataSource(dataSource, { dataSources, visualizations });
    this.setState({ essence });
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.globalHashChangeListener);

    require.ensure([
      'react-addons-css-transition-group',
      '../side-drawer/side-drawer'
    ], (require) => {
      this.setState({
        ReactCSSTransitionGroupAsync: require('react-addons-css-transition-group'),
        SideDrawerAsync: require('../side-drawer/side-drawer').SideDrawer
      });
    }, 'side-drawer');
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.globalHashChangeListener);
  }

  getDataSources(): List<DataSource> {
    var { essence } = this.state;
    return essence ? essence.dataSources : this.props.dataSources;
  }

  getEssenceFromHash(): Essence {
    var hash = window.location.hash;
    var dataSources = this.getDataSources();
    return Essence.fromHash(hash, { dataSources, visualizations });
  }

  globalHashChangeListener() {
    if (this.hashUpdating) return;
    var essence = this.getEssenceFromHash();
    if (!essence) return;
    this.setState({ essence });
  }

  sideDrawerOpen(drawerOpen: boolean): void {
    this.setState({ drawerOpen });
  }

  render() {
    var { homeLink, maxFilters, maxSplits, showLastUpdated, hideGitHubIcon, headerBackground } = this.props;
    var { ReactCSSTransitionGroupAsync, essence, drawerOpen, SideDrawerAsync } = this.state;
    if (!essence) return null;
    var sideDrawer: JSX.Element = null;
    if (drawerOpen && SideDrawerAsync) {
      var closeSideDrawer: () => void = this.sideDrawerOpen.bind(this, false);
      sideDrawer = <SideDrawerAsync
        key='drawer'
        changeDataSource={this.changeDataSource.bind(this)}
        essence={essence}
        onClose={closeSideDrawer}
        homeLink={homeLink}
      />;
    }

    if (ReactCSSTransitionGroupAsync) {
      var sideDrawerTransition = <ReactCSSTransitionGroupAsync
        component="div"
        className="side-drawer-container"
        transitionName="side-drawer"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}
      >
        {sideDrawer}
      </ReactCSSTransitionGroupAsync>;
    }

    return <main className='pivot-application' id='portal-cont'>
      <HeaderBar
        dataSource={essence.dataSource}
        onNavClick={this.sideDrawerOpen.bind(this, true)}
        showLastUpdated={showLastUpdated}
        hideGitHubIcon={hideGitHubIcon}
        color={headerBackground}
      />
      <CubeView essence={essence}
                maxFilters={maxFilters}
                maxSplits={maxSplits}
      />

      {sideDrawerTransition}
    </main>;
  }
}
