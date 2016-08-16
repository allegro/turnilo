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
import { findByName } from 'plywood';

import { replaceHash } from '../../utils/url/url';
import { DataCube, AppSettings, User, Collection, CollectionItem, Essence, ViewSupervisor } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';

import { createFunctionSlot, FunctionSlot } from '../../utils/function-slot/function-slot';
import { AboutModal, SideDrawer, Notifications, Notifier, AddCollectionItemModal } from '../../components/index';

import { HomeView } from '../home-view/home-view';
import { LinkView } from '../link-view/link-view';
import { CubeView } from '../cube-view/cube-view';
import { SettingsView } from '../settings-view/settings-view';
import { CollectionView } from '../collection-view/collection-view';
import { CollectionViewDelegate } from './collection-view-delegate/collection-view-delegate';

export interface PivotApplicationProps extends React.Props<any> {
  version: string;
  user?: User;
  maxFilters?: number;
  maxSplits?: number;
  appSettings: AppSettings;
  stateful?: boolean;
}

export interface PivotApplicationState {
  AboutModalAsync?: typeof AboutModal;
  NotificationsAsync?: typeof Notifications;
  ReactCSSTransitionGroupAsync?: typeof ReactCSSTransitionGroup;
  SideDrawerAsync?: typeof SideDrawer;

  appSettings?: AppSettings;
  drawerOpen?: boolean;
  selectedItem?: DataCube | Collection;
  viewType?: ViewType;
  viewHash?: string;
  showAboutModal?: boolean;
  showAddCollectionModal?: boolean;
  essenceToAddToACollection?: Essence;
  cubeViewSupervisor?: ViewSupervisor;
}

export type ViewType = "home" | "cube" | "collection" | "link" | "settings";

export const HOME: ViewType = "home";
export const CUBE: ViewType = "cube";
export const COLLECTION: ViewType = "collection";
export const LINK: ViewType = "link";
export const SETTINGS: ViewType = "settings";

export class PivotApplication extends React.Component<PivotApplicationProps, PivotApplicationState> {
  private hashUpdating: boolean = false;
  private sideBarHrefFn: FunctionSlot<string>;
  private collectionViewDelegate: CollectionViewDelegate;

  constructor() {
    super();
    this.collectionViewDelegate = new CollectionViewDelegate(this);
    this.sideBarHrefFn = createFunctionSlot<string>();
    this.state = {
      appSettings: null,
      drawerOpen: false,
      selectedItem: null,
      viewType: null,
      viewHash: null,
      showAboutModal: false
    };
    this.globalHashChangeListener = this.globalHashChangeListener.bind(this);
  }

  componentWillMount() {
    var { appSettings } = this.props;
    var { dataCubes, collections } = appSettings;

    var hash = window.location.hash;
    var viewType = this.getViewTypeFromHash(hash);

    if (viewType !== SETTINGS && !dataCubes.length) throw new Error('must have data cubes');

    var viewHash = this.getViewHashFromHash(hash);

    var selectedItem: DataCube | Collection;

    if (this.viewTypeNeedsAnItem(viewType)) {
      selectedItem = this.getSelectedItemFromHash(
        viewType === CUBE ? dataCubes : collections,
        hash,
        viewType
      );

      // If datacube / collection does not exist, then bounce to home
      if (!selectedItem) {
        this.changeHash('');
        viewType = HOME;
      }
    }

    if (viewType === HOME && dataCubes.length === 1 && collections.length === 0) {
      viewType = CUBE;
      selectedItem = dataCubes[0];
    }

    this.setState({
      viewType,
      viewHash,
      selectedItem,
      appSettings
    });
  }

  viewTypeNeedsAnItem(viewType: ViewType): boolean {
    return [CUBE, COLLECTION].indexOf(viewType) > -1;
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
    const { dataCubes, collections } = this.state.appSettings;
    var viewType = this.getViewTypeFromHash(hash);
    var viewHash = this.getViewHashFromHash(hash);
    var newState: PivotApplicationState = {
      viewType,
      viewHash,
      drawerOpen: false
    };

    if (this.viewTypeNeedsAnItem(viewType)) {
      let items = viewType === CUBE ? dataCubes : collections;
      let item = this.getSelectedItemFromHash(items, hash, viewType);
      newState.selectedItem = item ? item : items[0];
    } else {
      newState.selectedItem = null;
    }

    this.setState(newState);
  }

  parseHash(hash: string): string[] {
    if (hash[0] === '#') hash = hash.substr(1);
    return hash.split('/');
  }

  getViewTypeFromHash(hash: string): ViewType {
    const { user } = this.props;
    const appSettings = this.state.appSettings || this.props.appSettings;
    var viewType = this.parseHash(hash)[0];

    if (!viewType || viewType === HOME) return appSettings.linkViewConfig ? LINK : HOME;

    if (viewType === SETTINGS && user && user.allow['settings']) return SETTINGS;

    if (appSettings.linkViewConfig && viewType === LINK) return LINK;

    if (viewType === COLLECTION) return COLLECTION;

    return CUBE;
  }

  getSelectedItemFromHash(items: (DataCube | Collection)[], hash: string, viewType: ViewType): DataCube | Collection {
    // can change header from hash
    var parts = this.parseHash(hash);
    var itemName = parts[viewType === COLLECTION ? 1 : 0];

    return findByName(items, itemName);
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
      replaceHash('#' + hash);
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
      newHash = `${this.state.selectedItem.name}/${viewHash}`;
    } else if (viewType === COLLECTION) {
      newHash = `collection/${this.state.selectedItem.name}`;
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
    if (this.viewTypeNeedsAnItem(viewType)) {
      newPrefix = `${this.state.selectedItem.name}/`;
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

  addEssenceToCollection(essence: Essence) {
    this.setState({
      essenceToAddToACollection: essence,
      showAddCollectionModal: true
    });
  }

  renderAddCollectionModal() {
    const { appSettings, selectedItem, showAddCollectionModal, essenceToAddToACollection } = this.state;

    if (!showAddCollectionModal) return null;

    if (!DataCube.isDataCube(selectedItem)) {
      throw new Error(`Can't call this method without a valid dataCube. It's
        probably called from the wrong view.`);
    }

    const closeModal = () => {
      this.setState({
        showAddCollectionModal: false
      });
    };

    const onSave = (_collection: Collection, collectionItem: CollectionItem) => {
      closeModal();
      this.collectionViewDelegate.addItem(_collection, collectionItem).then(url => {
        Notifier.success('Item added', '', 3, {
          label: 'View',
          callback: () => window.location.hash = url
        });
      });
    };

    return <AddCollectionItemModal
      collections={appSettings.collections}
      essence={essenceToAddToACollection}
      dataCube={selectedItem as DataCube}
      onSave={onSave}
      onCancel={closeModal}
    />;
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
    var { maxFilters, maxSplits, user, version, stateful } = this.props;
    var {
      viewType,
      viewHash,
      selectedItem,
      ReactCSSTransitionGroupAsync,
      drawerOpen,
      SideDrawerAsync,
      appSettings,
      cubeViewSupervisor
    } = this.state;

    var { dataCubes, collections, customization, linkViewConfig } = appSettings;

    var sideDrawer: JSX.Element = null;
    if (drawerOpen && SideDrawerAsync) {
      var closeSideDrawer: () => void = this.sideDrawerOpen.bind(this, false);
      sideDrawer = <SideDrawerAsync
        key='drawer'
        selectedItem={selectedItem}
        collections={collections}
        dataCubes={dataCubes}
        onOpenAbout={this.openAboutModal.bind(this)}
        onClose={closeSideDrawer}
        customization={customization}
        user={user}
        itemHrefFn={this.sideBarHrefFn}
        viewType={viewType}
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
          dataCubes={dataCubes}
          collections={collections}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
          onOpenAbout={this.openAboutModal.bind(this)}
          customization={customization}
          collectionsDelegate={stateful ? this.collectionViewDelegate : null}
        />;
        break;

      case CUBE:
        view = <CubeView
          user={user}
          dataCube={selectedItem as DataCube}
          hash={viewHash}
          updateViewHash={this.updateViewHash.bind(this)}
          getUrlPrefix={this.getUrlPrefix.bind(this)}
          maxFilters={maxFilters}
          maxSplits={maxSplits}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
          customization={customization}
          transitionFnSlot={this.sideBarHrefFn}
          supervisor={cubeViewSupervisor}
          addEssenceToCollection={this.addEssenceToCollection.bind(this)}
          stateful={stateful}
        />;
        break;

      case COLLECTION:
        view = <CollectionView
          user={user}
          collections={collections}
          dataCubes={dataCubes}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
          customization={customization}
          delegate={stateful ? this.collectionViewDelegate : null}
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
          stateful={stateful}
        />;
        break;

      case SETTINGS:
        view = <SettingsView
          user={user}
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
      {this.renderAddCollectionModal()}
      {this.renderNotifications()}
    </main>;
  }
}
