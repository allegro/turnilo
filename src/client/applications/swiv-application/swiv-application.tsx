/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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

import './swiv-application.scss';

import * as React from 'react';
import { CSSTransition } from 'react-transition-group';
import { NamedArray} from "immutable-class";
import { EssenceToUrlPathConverter, UrlHashConverter } from "../../../common/utils/url-hash-converter/url-hash-converter";

import { replaceHash } from '../../utils/url/url';
import { DataCube, AppSettings, User, Collection, CollectionTile, Essence, Timekeeper, ViewSupervisor } from '../../../common/models';

import { createFunctionSlot, FunctionSlot } from '../../utils/function-slot/function-slot';
import { Ajax } from '../../utils/ajax/ajax';
import { AboutModal, AddCollectionTileModal } from '../../modals';
import { SideDrawer, Notifications, Questions, Notifier } from '../../components';

import { NoDataView } from '../../views/no-data-view/no-data-view';
import { HomeView } from '../../views/home-view/home-view';
import { LinkView } from '../../views/link-view/link-view';
import { CubeView } from '../../views/cube-view/cube-view';
import { SettingsView } from '../../views/settings-view/settings-view';
import { CollectionView } from '../../views/collection-view/collection-view';
import { CollectionViewDelegate } from './collection-view-delegate/collection-view-delegate';

export interface SwivApplicationProps {
  version: string;
  user?: User;
  maxFilters?: number;
  maxSplits?: number;
  appSettings: AppSettings;
  initTimekeeper?: Timekeeper;
  stateful?: boolean;
}

export interface SwivApplicationState {
  appSettings?: AppSettings;
  timekeeper?: Timekeeper;
  drawerOpen?: boolean;
  selectedItem?: DataCube | Collection;
  viewType?: ViewType;
  viewHash?: string;
  showAboutModal?: boolean;
  showAddTileModal?: boolean;
  essenceToAddToACollection?: Essence;
  cubeViewSupervisor?: ViewSupervisor;
}

export type ViewType = "home" | "cube" | "collection" | "link" | "settings" | "no-data";

export const HOME: ViewType = "home";
export const CUBE: ViewType = "cube";
export const COLLECTION: ViewType = "collection";
export const LINK: ViewType = "link";
export const SETTINGS: ViewType = "settings";
export const NO_DATA: ViewType = "no-data";

export class SwivApplication extends React.Component<SwivApplicationProps, SwivApplicationState> {
  private hashUpdating = false;
  private readonly sideBarHrefFn: FunctionSlot<string>;
  private readonly collectionViewDelegate: CollectionViewDelegate;
  private readonly urlHashConverter: EssenceToUrlPathConverter;

  constructor(props: SwivApplicationProps) {
    super(props);

    this.urlHashConverter = new UrlHashConverter();
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
    const { appSettings, initTimekeeper } = this.props;
    const { dataCubes, collections } = appSettings;

    const hash = window.location.hash;
    let viewType = this.getViewTypeFromHash(hash);

    if (viewType !== SETTINGS && !dataCubes.length) {
      window.location.hash = '';

      this.setState({
        viewType: NO_DATA,
        viewHash: '',
        appSettings
      });

      return;
    }

    const viewHash = this.getViewHashFromHash(hash);

    let selectedItem: DataCube | Collection;

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
      appSettings,
      timekeeper: initTimekeeper || Timekeeper.EMPTY
    });
  }

  viewTypeNeedsAnItem(viewType: ViewType): boolean {
    return [CUBE, COLLECTION].indexOf(viewType) > -1;
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.globalHashChangeListener);

    Ajax.settingsVersionGetter = () => {
      const { appSettings } = this.state;
      return appSettings.getVersion();
    };
    Ajax.onUpdate = () => {
      console.log('UPDATE!!');
    };

    // There was a clipboard module that did nothing here
    // maybe it should be restored one day
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
    const viewType = this.getViewTypeFromHash(hash);
    const viewHash = this.getViewHashFromHash(hash);
    const newState: SwivApplicationState = {
      viewType,
      viewHash,
      drawerOpen: false
    };

    if (this.viewTypeNeedsAnItem(viewType)) {
      const items = viewType === CUBE ? dataCubes : collections;
      const item = this.getSelectedItemFromHash(items, hash, viewType);
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
    const { dataCubes } = appSettings;
    const viewType = this.parseHash(hash)[0];

    if (viewType === SETTINGS && user && user.allow['settings']) return SETTINGS;

    if (!dataCubes || !dataCubes.length) return NO_DATA;

    if (!viewType || viewType === HOME) return appSettings.linkViewConfig ? LINK : HOME;

    if (appSettings.linkViewConfig && viewType === LINK) return LINK;

    if (viewType === COLLECTION) return COLLECTION;

    if (viewType === NO_DATA) return NO_DATA;

    return CUBE;
  }

  getSelectedItemFromHash(items: (DataCube | Collection)[], hash: string, viewType: ViewType): DataCube | Collection {
    // can change header from hash
    const parts = this.parseHash(hash);
    const itemName = parts[viewType === COLLECTION ? 1 : 0];

    return NamedArray.findByName(items, itemName);
  }

  getViewHashFromHash(hash: string): string {
    const parts = this.parseHash(hash);
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
    const { viewType } = this.state;

    let newHash: string;
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

  getCubeViewHash = (essence: Essence, withPrefix = false): string => {
    const cubeViewHash = this.urlHashConverter.toHash(essence);

    return withPrefix ? this.getUrlPrefix() + cubeViewHash : cubeViewHash;
  }

  getUrlPrefix(baseOnly = false): string {
    const { viewType } = this.state;
    const url = window.location;
    const urlBase = url.origin + url.pathname;
    if (baseOnly) return urlBase;

    let newPrefix: string;
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
      showAddTileModal: true
    });
  }

  renderAddTileModal() {
    const { appSettings, selectedItem, timekeeper, showAddTileModal, essenceToAddToACollection } = this.state;

    if (!showAddTileModal) return null;

    if (!DataCube.isDataCube(selectedItem)) {
      throw new Error(`Can't call this method without a valid dataCube. It's
        probably called from the wrong view.`);
    }

    const closeModal = () => {
      this.setState({
        showAddTileModal: false
      });
    };

    const onSave = (_collection: Collection, CollectionTile: CollectionTile) => {
      closeModal();
      this.collectionViewDelegate.addTile(_collection, CollectionTile).then(url => {
        Notifier.success('Item added', {
          label: 'View collection',
          callback: () => window.location.hash = `#collection/${_collection.name}`
        });
      });
    };

    return <AddCollectionTileModal
      collections={appSettings.collections}
      essence={essenceToAddToACollection}
      timekeeper={timekeeper}
      dataCube={selectedItem as DataCube}
      onSave={onSave}
      onCancel={closeModal}
    />;
  }

  renderAboutModal() {
    const { version } = this.props;
    const { showAboutModal } = this.state;
    if (!showAboutModal) return null;
    return <AboutModal
      version={version}
      onClose={this.onAboutModalClose.bind(this)}
    />;
  }

  renderNotifications() {
    return <Notifications />;
  }

  renderQuestions() {
    return <Questions />;
  }

  renderSideDrawer() {
    const { user } = this.props;
    const { viewType, selectedItem, appSettings } = this.state;
    const { dataCubes, collections, customization } = appSettings;

    const closeSideDrawer: () => void = this.sideDrawerOpen.bind(this, false);

    return <SideDrawer
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

  renderSideDrawerTransition() {
    const { drawerOpen } = this.state;
    return <CSSTransition
      in={drawerOpen}
      classNames="side-drawer"
      mountOnEnter={true}
      unmountOnExit={true}
      timeout={{ enter: 500, exit: 300 }}
    >
      {this.renderSideDrawer()}
    </CSSTransition>;
  }

  saveDataCubes(newSettings: AppSettings): Promise<any> {
    return Ajax.query({
      method: "POST",
      url: 'dataCubes',
      data: {
        dataCubes: newSettings.dataCubes
      }
    })
      .then(
        (status) => this.setState({
          appSettings: newSettings
        }),
        (xhr: XMLHttpRequest) => {
          Notifier.failure('Woops', 'Something bad happened');
        }
      );
  }

  updateDataCube(dataCube: DataCube) {
    const appSettings = this.state.appSettings as AppSettings;

    this.saveDataCubes(appSettings.addOrUpdateDataCube(dataCube));
  }

  deleteDataCube(dataCube: DataCube) {
    const appSettings = this.state.appSettings as AppSettings;

    this.saveDataCubes(appSettings.deleteDataCube(dataCube));
  }

  renderView() {
    const { maxFilters, maxSplits, user, stateful } = this.props;
    const { viewType, viewHash, selectedItem, appSettings, timekeeper, cubeViewSupervisor } = this.state;
    const { dataCubes, collections, customization, linkViewConfig } = appSettings;

    switch (viewType) {
      case NO_DATA:
        return <NoDataView
          user={user}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
          onOpenAbout={this.openAboutModal.bind(this)}
          customization={customization}
          appSettings={appSettings}
          stateful={stateful}
        />;

      case HOME:
        return <HomeView
          user={user}
          dataCubes={dataCubes}
          collections={collections}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
          onOpenAbout={this.openAboutModal.bind(this)}
          customization={customization}
          collectionsDelegate={this.collectionViewDelegate}
          updateDataCube={this.updateDataCube.bind(this)}
          deleteDataCube={this.deleteDataCube.bind(this)}
          stateful={stateful}
        />;

      case CUBE:
        return <CubeView
          user={user}
          dataCube={selectedItem as DataCube}
          initTimekeeper={timekeeper}
          hash={viewHash}
          updateViewHash={this.updateViewHash.bind(this)}
          getCubeViewHash={this.getCubeViewHash}
          getEssenceFromHash={this.urlHashConverter.essenceFromHash}
          maxFilters={maxFilters}
          maxSplits={maxSplits}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
          customization={customization}
          transitionFnSlot={this.sideBarHrefFn}
          supervisor={cubeViewSupervisor}
          addEssenceToCollection={this.addEssenceToCollection.bind(this)}
          stateful={stateful}
        />;

      case COLLECTION:
        return <CollectionView
          user={user}
          collections={collections}
          timekeeper={timekeeper}
          dataCubes={dataCubes}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
          customization={customization}
          delegate={stateful ? this.collectionViewDelegate : null}
          getCubeViewHash={this.getCubeViewHash}
        />;

      case LINK:
        return <LinkView
          user={user}
          collection={linkViewConfig}
          timekeeper={timekeeper}
          hash={viewHash}
          updateViewHash={this.updateViewHash.bind(this)}
          changeHash={this.changeHash.bind(this)}
          getCubeViewHash={this.getCubeViewHash}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
          customization={customization}
          stateful={stateful}
        />;

      case SETTINGS:
        return <SettingsView
          user={user}
          onNavClick={this.sideDrawerOpen.bind(this, true)}
          onSettingsChange={this.onSettingsChange.bind(this)}
          customization={customization}
        />;

      default:
        throw new Error('unknown view');
    }
  }

  render() {
    return <main className='swiv-application'>
      {this.renderView()}
      {this.renderSideDrawerTransition()}
      {this.renderAboutModal()}
      {this.renderAddTileModal()}
      {this.renderNotifications()}
      {this.renderQuestions()}
    </main>;
  }
}
