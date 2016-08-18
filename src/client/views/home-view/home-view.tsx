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

require('./home-view.css');

import * as React from 'react';
import { Collection, Stage, DataCube, User, Customization } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { Fn } from '../../../common/utils/general/general';

import { AddCollectionModal } from '../../modals/index';
import { HomeHeaderBar, SvgIcon } from '../../components/index';
import { ItemCard } from './item-card/item-card';

export interface HomeViewProps extends React.Props<any> {
  dataCubes?: DataCube[];
  collections?: Collection[];
  user?: User;
  onNavClick?: Fn;
  onOpenAbout: Fn;
  customization?: Customization;
  collectionsDelegate?: {
    addCollection: (collection: Collection) => void;
  };
}

export interface HomeViewState {
  showAddCollectionModal?: boolean;
}

export class HomeView extends React.Component< HomeViewProps, HomeViewState> {

  constructor() {
    super();
    this.state = {};
  }

  goToItem(item: DataCube | Collection) {
    var fragments = item.name;

    if (Collection.isCollection(item)) {
      fragments = 'collection/' + fragments;
    }

    window.location.hash = '#' + fragments;
  }

  goToSettings() {
    window.location.hash = '#settings';
  }

  renderSettingsIcon() {
    const { user } = this.props;
    if (!user || !user.allow['settings']) return null;

    return <div className="icon-button" onClick={this.goToSettings.bind(this)}>
      <SvgIcon svg={require('../../icons/full-settings.svg')}/>
    </div>;
  }

  renderItem(item: DataCube | Collection): JSX.Element {
    return <ItemCard
      key={item.name}
      title={item.title}
      count={Collection.isCollection(item) ? item.tiles.length : undefined}
      description={item.description}
      icon={item instanceof DataCube ? 'full-cube' : 'full-collection'}
      onClick={this.goToItem.bind(this, item)}
    />;
  }

  renderItems(items: (DataCube | Collection)[], adder?: JSX.Element): JSX.Element {
    return <div className="items-container">
        {items.map(this.renderItem, this)}

        {/* So that the last item doesn't span on the entire row*/}
        {adder || <div className="item-card empty"/>}
        <div className="item-card empty"/>
        <div className="item-card empty"/>
        <div className="item-card empty"/>
      </div>;
  }

  createCollection() {
    this.setState({
      showAddCollectionModal: true
    });
  }

  renderAddCollectionModal(): JSX.Element {
    const { collections, collectionsDelegate } = this.props;

    const closeModal = () => {
      this.setState({
        showAddCollectionModal: false
      });
    };

    const addCollection = (collection: Collection) => {
      closeModal();
      collectionsDelegate.addCollection(collection);
    };

    return <AddCollectionModal
      collections={collections}
      onCancel={closeModal}
      onSave={addCollection}
    />;
  }

  renderDataCubes() {
    const { dataCubes } = this.props;

    return <div className="datacubes">
      <div className="section-title">{STRINGS.dataCubes}</div>
      {this.renderItems(dataCubes)}
    </div>;
  }

  renderCollections() {
    const { collections, collectionsDelegate } = this.props;
    if (!collectionsDelegate && collections.length === 0) return null;

    const create = this.createCollection.bind(this);

    return <div className="collections">
      <div className="grid-row">
        <div className="grid-col-90 section-title">{STRINGS.collections}</div>
        <div className="grid-col-10 right actions">
          { collectionsDelegate && collections.length > 4 ?
            <div className="add" onClick={create}>
              <SvgIcon svg={require('../../icons/full-add.svg')}/>
            </div>
          : null }
        </div>
      </div>
      {this.renderItems(
        collections,
        collectionsDelegate ? ItemCard.getNewItemCard(create) : null
      )}
    </div>;
  }

  render() {
    const { user, onNavClick, onOpenAbout, customization } = this.props;
    const { showAddCollectionModal } = this.state;

    return <div className="home-view">
      <HomeHeaderBar
        user={user}
        onNavClick={onNavClick}
        customization={customization}
        title={STRINGS.home}
      >
        <button className="text-button" onClick={onOpenAbout}>
          {STRINGS.infoAndFeedback}
        </button>
        {this.renderSettingsIcon()}
      </HomeHeaderBar>

      <div className="container">
        {this.renderDataCubes()}
        {this.renderCollections()}
      </div>
      {showAddCollectionModal ? this.renderAddCollectionModal() : null}
    </div>;
  }
}
