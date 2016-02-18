'use strict';
require('./pivot-application.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { List } from 'immutable';
import { DataSource } from "../../../common/models/index";

import { CubeHeaderBar } from '../cube-header-bar/cube-header-bar';
import { SideDrawer, SideDrawerProps } from '../side-drawer/side-drawer';
import { CubeView } from '../cube-view/cube-view';

import { HomeHeaderBar } from '../home-header-bar/home-header-bar';
import { HomeView } from '../home-view/home-view';

import { visualizations } from '../../visualizations/index';

export interface PivotApplicationProps extends React.Props<any> {
  version: string;
  dataSources: List<DataSource>;
  maxFilters?: number;
  maxSplits?: number;
  showLastUpdated?: boolean;
  hideGitHubIcon?: boolean;
  headerBackground?: string;
}

export interface PivotApplicationState {
  ReactCSSTransitionGroupAsync?: typeof ReactCSSTransitionGroup;
  SideDrawerAsync?: typeof SideDrawer;
  drawerOpen?: boolean;
  dataSources?: List<DataSource>;
  selectedDataSource?: DataSource;
  viewType?: string;
  viewHash?: string;
}

export const HOME = "home";
export const CUBE = "cube";

export class PivotApplication extends React.Component<PivotApplicationProps, PivotApplicationState> {
  private hashUpdating: boolean = false;

  constructor() {
    super();
    this.state = {
      ReactCSSTransitionGroupAsync: null,
      SideDrawerAsync: null,
      drawerOpen: false,
      dataSources: null,
      selectedDataSource: null,
      viewType: null,
      viewHash: null
    };
    this.globalHashChangeListener = this.globalHashChangeListener.bind(this);
  }

  componentWillMount() {
    var { dataSources } = this.props;
    var viewType = HOME;

    if (!dataSources.size) throw new Error('must have data sources');
    var selectedDataSource = dataSources.first();
    var hash = window.location.hash;

    // basically, if there's only one "link" other than info & feedback to click (so later, if also no collections etc)
    if (dataSources.size === 1) {
      viewType = CUBE;
    } else {
      viewType = this.getViewTypeFromHash(hash);
      var hashDataSource = this.getDataSourceFromHash(dataSources, hash);
      if (hashDataSource && !hashDataSource.equals(selectedDataSource)) selectedDataSource = hashDataSource;
    }

    var viewHash = this.getViewHashFromHash(hash);
    this.setState({ dataSources, viewType, viewHash, selectedDataSource });
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

  changeDataSource(dataSource: DataSource) {
    const { viewType, selectedDataSource } = this.state;

    var newState: PivotApplicationState = {};
    if (viewType !== CUBE) {
      newState.viewType = CUBE;
    }
    if (!selectedDataSource.equals(dataSource)) {
      newState.selectedDataSource = dataSource;
    }

    this.setState(newState);
  };

  globalHashChangeListener(): void {
    var hash = window.location.hash;

    if (this.hashUpdating) return;

    var viewType = this.getViewTypeFromHash(hash);
    this.setState({ viewType });

    if (viewType === CUBE) {
      var dataSource = this.getDataSourceFromHash(this.state.dataSources, hash);
      if (!dataSource) dataSource = this.props.dataSources.first();

      var viewHash = this.getViewHashFromHash(hash);

      this.changeDataSource(dataSource);

      if (viewHash !== this.state.viewHash) {
        this.setState({ viewHash });
      }
    }
    this.sideDrawerOpen(false);
  }

  parseHash(hash: string): string[] {
    if (hash[0] === '#') hash = hash.substr(1);
    return hash.split('/');
  }

  getViewTypeFromHash(hash: string): string {
    var hashPart = this.parseHash(hash).shift();
    if (!hashPart) return HOME;
    return CUBE;
  }

  getDataSourceFromHash(dataSources: List<DataSource>, hash: string): DataSource {
    // can change header from hash
    var parts = this.parseHash(hash);
    var dataSourceName = parts.shift();
    return dataSources.find((ds) => ds.name === dataSourceName);
  }

  getViewHashFromHash(hash: string): string {
    var parts = this.parseHash(hash);
    if (parts.length < 4) return null;
    parts.shift();
    return parts.join('/');
  }

  sideDrawerOpen(drawerOpen: boolean): void {
    this.setState({ drawerOpen });
  }

  updateHash(newHash: string): void {
    var { viewType } = this.state;

    if (viewType === CUBE) {
      newHash = `${this.state.selectedDataSource.name}/${newHash}`;
    } else {
      newHash = viewType;
    }

    this.hashUpdating = true;
    window.location.hash = `#${newHash}`;
    setTimeout(() => {
      this.hashUpdating = false;
    }, 5);
  }

  getUrlPrefix(baseOnly = false): string {
    var { viewType } = this.state;
    var url = window.location;
    var urlBase = url.origin + url.pathname;
    if (baseOnly) return urlBase;

    var newPrefix: string;
    if (viewType === CUBE) {
      newPrefix = `${this.state.selectedDataSource.name}/`;
    } else {
      newPrefix = viewType;
    }

    return urlBase + '#' + newPrefix;
  }

  render() {
    var { maxFilters, maxSplits, showLastUpdated, hideGitHubIcon, headerBackground } = this.props;
    var { dataSources, viewType, viewHash, selectedDataSource, ReactCSSTransitionGroupAsync, drawerOpen, SideDrawerAsync } = this.state;

    var sideDrawer: JSX.Element = null;
    if (drawerOpen && SideDrawerAsync) {
      var closeSideDrawer: () => void = this.sideDrawerOpen.bind(this, false);
      sideDrawer = <SideDrawerAsync
        key='drawer'
        changeDataSource={this.changeDataSource.bind(this)}
        selectedDataSource={selectedDataSource}
        dataSources={dataSources}
        onClose={closeSideDrawer}
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

    var header: JSX.Element = null;
    var view: JSX.Element = null;

    if (viewType === CUBE) {
      header = <CubeHeaderBar
        dataSource={selectedDataSource}
        onNavClick={this.sideDrawerOpen.bind(this, true)}
        showLastUpdated={showLastUpdated}
        hideGitHubIcon={hideGitHubIcon}
        color={headerBackground}
        getUrlPrefix={this.getUrlPrefix.bind(this)}
      />;
      view = <CubeView
        selectedDataSource={selectedDataSource}
        hash={viewHash}
        updateHash={this.updateHash.bind(this)}
        getUrlPrefix={this.getUrlPrefix.bind(this)}
        maxFilters={maxFilters}
        maxSplits={maxSplits}
      />;

    } else {
      header = <HomeHeaderBar
        onNavClick={this.sideDrawerOpen.bind(this, true)}
      />;
      view = <HomeView
        dataCubes={dataSources}
        selectDataCube={this.changeDataSource.bind(this)}
      />;
    }

    return <main className='pivot-application'>
      {header}
      {view}
      {sideDrawerTransition}
    </main>;
  }
}
