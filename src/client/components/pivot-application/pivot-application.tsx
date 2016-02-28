require('./pivot-application.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { List } from 'immutable';
import { DataSource, LinkViewConfig, LinkViewConfigJS, User } from "../../../common/models/index";

import { SideDrawer, SideDrawerProps } from '../side-drawer/side-drawer';
import { HomeView } from '../home-view/home-view';
import { CubeView } from '../cube-view/cube-view';
import { LinkView } from '../link-view/link-view';

import { visualizations } from '../../visualizations/index';

export interface PivotApplicationProps extends React.Props<any> {
  version: string;
  dataSources: List<DataSource>;
  linkViewConfig?: LinkViewConfigJS;
  user?: User;
  maxFilters?: number;
  maxSplits?: number;
}

export interface PivotApplicationState {
  ReactCSSTransitionGroupAsync?: typeof ReactCSSTransitionGroup;
  SideDrawerAsync?: typeof SideDrawer;
  drawerOpen?: boolean;
  selectedDataSource?: DataSource;
  viewType?: ViewType;
  viewHash?: string;
  linkViewConfig?: LinkViewConfig;
}

export type ViewType = "home" | "cube" | "link";

export const HOME: ViewType = "home";
export const CUBE: ViewType = "cube";
export const LINK: ViewType = "link";

export class PivotApplication extends React.Component<PivotApplicationProps, PivotApplicationState> {
  private hashUpdating: boolean = false;

  constructor() {
    super();
    this.state = {
      ReactCSSTransitionGroupAsync: null,
      SideDrawerAsync: null,
      drawerOpen: false,
      selectedDataSource: null,
      viewType: null,
      viewHash: null,
      linkViewConfig: null
    };
    this.globalHashChangeListener = this.globalHashChangeListener.bind(this);
  }

  componentWillMount() {
    var { dataSources } = this.props;
    if (!dataSources.size) throw new Error('must have data sources');

    var linkViewConfigJS = this.props.linkViewConfig;
    if (linkViewConfigJS) {
      this.setState({
        viewType: LINK,
        linkViewConfig: LinkViewConfig.fromJS(linkViewConfigJS, { dataSources, visualizations })
      });
    } else {
      var hash = window.location.hash;
      var viewType = this.getViewTypeFromHash(hash);
      var selectedDataSource = this.getDataSourceFromHash(dataSources, hash);
      var viewHash = this.getViewHashFromHash(hash);

      if (viewType === HOME && dataSources.size === 1) {
        selectedDataSource = dataSources.first();
        viewType = CUBE;
      }

      this.setState({ viewType, viewHash, selectedDataSource });
    }
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
    if (!selectedDataSource || !selectedDataSource.equals(dataSource)) {
      newState.selectedDataSource = dataSource;
    }

    this.setState(newState);
  };

  globalHashChangeListener(): void {
    const { dataSources } = this.props;
    var hash = window.location.hash;

    if (this.hashUpdating) return;

    var viewType = this.getViewTypeFromHash(hash);
    this.setState({ viewType });

    if (viewType === CUBE) {
      var dataSource = this.getDataSourceFromHash(dataSources, hash);
      if (!dataSource) dataSource = dataSources.first();

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

  getViewTypeFromHash(hash: string): ViewType {
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
    var { dataSources, maxFilters, maxSplits, user } = this.props;
    var { viewType, viewHash, selectedDataSource, ReactCSSTransitionGroupAsync, drawerOpen, SideDrawerAsync, linkViewConfig } = this.state;

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

    var view: JSX.Element = null;
    if (selectedDataSource) {
      viewType = LINK;
    }
    switch (viewType) {
      case HOME:
        view = <HomeView
          user={user}
          dataCubes={dataSources}
          selectDataCube={this.changeDataSource.bind(this)}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
        />;
        break;

      case CUBE:
        view = <CubeView
          user={user}
          dataSource={selectedDataSource}
          hash={viewHash}
          updateHash={this.updateHash.bind(this)}
          getUrlPrefix={this.getUrlPrefix.bind(this)}
          maxFilters={maxFilters}
          maxSplits={maxSplits}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
        />;
        break;

      case LINK:
        view = <LinkView
          user={user}
          linkViewConfig={linkViewConfig}
          hash={viewHash}
          updateHash={this.updateHash.bind(this)}
          getUrlPrefix={this.getUrlPrefix.bind(this)}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
        />;
        break;

      default:
        throw new Error('unknown view');
    }

    return <main className='pivot-application'>
      {view}
      {sideDrawerTransition}
    </main>;
  }
}
