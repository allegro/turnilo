/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('./pivot-application.css');

import * as React from 'react';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { helper } from 'plywood';

import { DataSource, AppSettings, User } from '../../../common/models/index';

import { createFunctionSlot, FunctionSlot } from '../../utils/function-slot/function-slot';
import { AboutModal } from '../../components/about-modal/about-modal';
import { SideDrawer } from '../../components/side-drawer/side-drawer';
import { Notifications, Notifier } from '../../components/notifications/notifications';

import { HomeView } from '../home-view/home-view';
import { LinkView } from '../link-view/link-view';
import { CubeView } from '../cube-view/cube-view';
import { SettingsView } from '../settings-view/settings-view';

export interface PivotApplicationProps extends React.Props<any> {
  version: string;
  user?: User;
  maxFilters?: number;
  maxSplits?: number;
  readOnly?: boolean;
  appSettings: AppSettings;
}

export interface PivotApplicationState {
  AboutModalAsync?: typeof AboutModal;
  NotificationsAsync?: typeof Notifications;
  ReactCSSTransitionGroupAsync?: typeof ReactCSSTransitionGroup;
  SideDrawerAsync?: typeof SideDrawer;

  appSettings?: AppSettings;
  drawerOpen?: boolean;
  selectedDataSource?: DataSource;
  viewType?: ViewType;
  viewHash?: string;
  showAboutModal?: boolean;
}

export type ViewType = "home" | "cube" | "link" | "settings";

export const HOME: ViewType = "home";
export const CUBE: ViewType = "cube";
export const LINK: ViewType = "link";
export const SETTINGS: ViewType = "settings";

export class PivotApplication extends React.Component<PivotApplicationProps, PivotApplicationState> {
  private hashUpdating: boolean = false;
  private sideBarHrefFn: FunctionSlot<string>;

  constructor() {
    super();
    this.sideBarHrefFn = createFunctionSlot<string>();
    this.state = {
      appSettings: null,
      drawerOpen: false,
      selectedDataSource: null,
      viewType: null,
      viewHash: null,
      showAboutModal: false
    };
    this.globalHashChangeListener = this.globalHashChangeListener.bind(this);
  }

  componentWillMount() {
    var { appSettings } = this.props;
    var { dataSources } = appSettings;
    if (!dataSources.length) throw new Error('must have data sources');

    var hash = window.location.hash;
    var viewType = this.getViewTypeFromHash(hash);
    var selectedDataSource = this.getDataSourceFromHash(appSettings.dataSources, hash);
    var viewHash = this.getViewHashFromHash(hash);

    // If datasource does not exit bounce to home
    if (viewType === CUBE && !selectedDataSource) {
      this.changeHash('');
      viewType = HOME;
    }

    if (viewType === HOME && dataSources.length === 1) {
      viewType = CUBE;
      selectedDataSource = dataSources[0];
    }

    this.setState({
      viewType,
      viewHash,
      selectedDataSource,
      appSettings
    });
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.globalHashChangeListener);

    require.ensure(['clipboard'], (require) => {
      var Clipboard = require('clipboard');
      var clipboard = new Clipboard('.clipboard');

      clipboard.on('success', (e: any) => {
        // ToDo: do something here
      });
    }, 'clipboard');

    require.ensure(['react-addons-css-transition-group', '../../components/side-drawer/side-drawer'], (require) => {
      this.setState({
        ReactCSSTransitionGroupAsync: require('react-addons-css-transition-group'),
        SideDrawerAsync: require('../../components/side-drawer/side-drawer').SideDrawer
      });
    }, 'side-drawer');

    require.ensure(['../../components/about-modal/about-modal'], (require) => {
      this.setState({
        AboutModalAsync: require('../../components/about-modal/about-modal').AboutModal
      });
    }, 'about-modal');

    require.ensure(['../../components/notifications/notifications'], (require) => {
      this.setState({
        NotificationsAsync: require('../../components/notifications/notifications').Notifications
      });
    }, 'notifications');
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.globalHashChangeListener);
  }

  globalHashChangeListener(): void {
    if (this.hashUpdating) return;
    this.hashToState(window.location.hash);
  }

  hashToState(hash: string) {
    const { dataSources } = this.state.appSettings;
    var viewType = this.getViewTypeFromHash(hash);
    var viewHash = this.getViewHashFromHash(hash);
    var newState: PivotApplicationState = {
      viewType,
      viewHash,
      drawerOpen: false
    };

    if (viewType === CUBE) {
      var dataSource = this.getDataSourceFromHash(dataSources, hash);
      if (!dataSource) dataSource = dataSources[0];
      newState.selectedDataSource = dataSource;
    } else {
      newState.selectedDataSource = null;
    }

    this.setState(newState);
  }

  parseHash(hash: string): string[] {
    if (hash[0] === '#') hash = hash.substr(1);
    return hash.split('/');
  }

  getViewTypeFromHash(hash: string): ViewType {
    const { readOnly } = this.props;
    const appSettings = this.state.appSettings || this.props.appSettings;
    var viewType = this.parseHash(hash)[0];
    if (!viewType || viewType === HOME) return appSettings.linkViewConfig ? LINK : HOME;
    if (viewType === SETTINGS) return readOnly ? HOME : SETTINGS;
    if (appSettings.linkViewConfig && viewType === LINK) return LINK;
    return CUBE;
  }

  getDataSourceFromHash(dataSources: DataSource[], hash: string): DataSource {
    // can change header from hash
    var parts = this.parseHash(hash);
    var dataSourceName = parts.shift();
    return helper.findByName(dataSources, dataSourceName);
  }

  getViewHashFromHash(hash: string): string {
    var parts = this.parseHash(hash);
    if (parts.length < 2) return null;
    parts.shift();
    return parts.join('/');
  }

  sideDrawerOpen(drawerOpen: boolean): void {
    this.setState({ drawerOpen });
  }

  changeHash(hash: string, force = false): void {
    this.hashUpdating = true;

    // Hash initialization, no need to add the intermediary url in the history
    if (window.location.hash === `#${hash.split('/')[0]}`) {
      window.history.replaceState(undefined, undefined, `#${hash}`);
    } else {
      window.location.hash = `#${hash}`;
    }

    setTimeout(() => {
      this.hashUpdating = false;
    }, 5);
    if (force) this.hashToState(hash);
  }

  updateViewHash(viewHash: string, force = false): void {
    var { viewType } = this.state;

    var newHash: string;
    if (viewType === CUBE) {
      newHash = `${this.state.selectedDataSource.name}/${viewHash}`;
    } else if (viewType === LINK) {
      newHash = `${viewType}/${viewHash}`;
    } else {
      newHash = viewType;
    }

    this.changeHash(newHash, force);
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

  openAboutModal() {
    this.setState({
      showAboutModal: true
    });
  }

  onAboutModalClose() {
    this.setState({
      showAboutModal: false
    });
  }

  onSettingsChange(newSettings: AppSettings) {
    this.setState({
      appSettings: newSettings
    });
  }

  renderAboutModal() {
    const { version } = this.props;
    const { AboutModalAsync, showAboutModal } = this.state;
    if (!AboutModalAsync || !showAboutModal) return null;
    return <AboutModalAsync
      version={version}
      onClose={this.onAboutModalClose.bind(this)}
    />;
  }

  renderNotifications() {
    const { version } = this.props;
    const { NotificationsAsync } = this.state;
    if (!NotificationsAsync) return null;
    return <NotificationsAsync/>;
  }

  render() {
    var { maxFilters, maxSplits, user, version } = this.props;
    var { viewType, viewHash, selectedDataSource, ReactCSSTransitionGroupAsync, drawerOpen, SideDrawerAsync, appSettings } = this.state;
    var { dataSources, customization, linkViewConfig } = appSettings;

    var sideDrawer: JSX.Element = null;
    if (drawerOpen && SideDrawerAsync) {
      var closeSideDrawer: () => void = this.sideDrawerOpen.bind(this, false);
      sideDrawer = <SideDrawerAsync
        key='drawer'
        selectedDataSource={selectedDataSource}
        dataSources={dataSources}
        onOpenAbout={this.openAboutModal.bind(this)}
        onClose={closeSideDrawer}
        customization={customization}
        itemHrefFn={this.sideBarHrefFn}
        isCube={viewType === CUBE && !linkViewConfig}
        isLink={viewType === LINK || !!linkViewConfig}
        isHome={viewType === HOME}
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
    switch (viewType) {
      case HOME:
        view = <HomeView
          user={user}
          dataSources={dataSources}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
          onOpenAbout={this.openAboutModal.bind(this)}
          customization={customization}
        />;
        break;

      case CUBE:
        view = <CubeView
          user={user}
          dataSource={selectedDataSource}
          hash={viewHash}
          updateViewHash={this.updateViewHash.bind(this)}
          getUrlPrefix={this.getUrlPrefix.bind(this)}
          maxFilters={maxFilters}
          maxSplits={maxSplits}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
          customization={customization}
          transitionFnSlot={this.sideBarHrefFn}
        />;
        break;

      case LINK:
        view = <LinkView
          user={user}
          linkViewConfig={linkViewConfig}
          hash={viewHash}
          updateViewHash={this.updateViewHash.bind(this)}
          changeHash={this.changeHash.bind(this)}
          getUrlPrefix={this.getUrlPrefix.bind(this)}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
          customization={customization}
        />;
        break;

      case SETTINGS:
        view = <SettingsView
          user={user}
          hash={window.location.hash}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
          onSettingsChange={this.onSettingsChange.bind(this)}
          customization={customization}
          version={version}
        />;
        break;

      default:
        throw new Error('unknown view');
    }

    return <main className='pivot-application'>
      {view}
      {sideDrawerTransition}
      {this.renderAboutModal()}
      {this.renderNotifications()}
    </main>;
  }
}
