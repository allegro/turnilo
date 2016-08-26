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
import * as Q from 'q';

import { Collection, Stage, DataCube, User, Customization } from '../../../common/models/index';
import { STRINGS } from '../../config/constants';
import { Fn } from '../../../common/utils/general/general';

import { generateUniqueName } from '../../../common/utils/string/string';
import { indexByAttribute } from '../../../common/utils/array/array';

import { NameDescriptionModal } from '../../modals/index';
import { SvgIcon } from '../../components/index';

import { HomeHeaderBar} from './home-header-bar/home-header-bar';
import { ItemCard } from './item-card/item-card';

export interface HomeViewProps extends React.Props<any> {
  dataCubes?: DataCube[];
  collections?: Collection[];
  user?: User;
  onNavClick?: Fn;
  onOpenAbout: Fn;
  customization?: Customization;
  stateful?: boolean;
  collectionsDelegate?: {
    addCollection: (collection: Collection) => Q.Promise<string>;
    deleteCollection: (collection: Collection) => void;
    updateCollection: (collection: Collection) => Q.Promise<any>;
  };

  updateDataCube?: (dataCube: DataCube) => void;
  deleteDataCube?: (dataCube: DataCube) => void;
}

export interface HomeViewState {
  showAddCollectionModal?: boolean;
  editedItem?: DataCube | Collection;
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
    const { user, stateful } = this.props;
    if (!user || !user.allow['settings'] || !stateful) return null;

    return <div className="icon-button" onClick={this.goToSettings.bind(this)}>
      <SvgIcon svg={require('../../icons/full-settings.svg')}/>
    </div>;
  }

  editItem(item: DataCube | Collection) {
    this.setState({
      editedItem: item
    });
  }

  deleteCollection(collection: Collection) {
    this.props.collectionsDelegate.deleteCollection(collection);
  }

  renderItem(item: DataCube | Collection): JSX.Element {
    const isDataCube = DataCube.isDataCube(item);
    const { stateful } = this.props;

    if (!stateful) {
      return <ItemCard
        key={item.name}
        title={item.title}
        count={isDataCube ? undefined : (item as Collection).tiles.length}
        description={item.description}
        icon={isDataCube ? 'full-cube' : 'full-collection'}
        onClick={this.goToItem.bind(this, item)}
      />;
    }

    return <ItemCard
      key={item.name}
      title={item.title}
      count={isDataCube ? undefined : (item as Collection).tiles.length}
      description={item.description}
      icon={isDataCube ? 'full-cube' : 'full-collection'}
      onClick={this.goToItem.bind(this, item)}
      onEdit={this.editItem.bind(this, item)}
      onDelete={isDataCube ? this.props.deleteDataCube.bind(this, item) : this.deleteCollection.bind(this, item)}
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

    const newCollection = new Collection({
      name: generateUniqueName('c', name => indexByAttribute(collections, 'name', name) === -1),
      tiles: [],
      title: 'New collection'
    });

    const closeModal = () => {
      this.setState({
        showAddCollectionModal: false
      });
    };

    const addCollection = (collection: Collection) => {
      collectionsDelegate.addCollection(collection).then((url) => {
        closeModal();
        window.location.hash = url;
      });
    };

    const CollectionModal = NameDescriptionModal.specialize<Collection>();

    return <CollectionModal
      title={STRINGS.addNewCollection}
      onCancel={closeModal}
      onSave={addCollection}
      item={newCollection}
      okTitle={STRINGS.create}
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
              <SvgIcon svg={require('../../icons/full-add-framed.svg')}/>
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

  renderEditModal() {
    const { editedItem } = this.state;

    if (DataCube.isDataCube(editedItem)) return this.renderEditDataCubeModal();

    return this.renderEditCollectionModal();
  }

  renderEditCollectionModal(): JSX.Element {
    const { collectionsDelegate } = this.props;
    const editedItem = this.state.editedItem as Collection;

    const EditionModal = NameDescriptionModal.specialize<Collection>();

    const closeModal = () => {
      this.setState({
        editedItem: undefined
      });
    };

    const update = (collection: Collection) => {
      collectionsDelegate.updateCollection(collection).then(closeModal);
    };

    return <EditionModal
      title={STRINGS.editCollection}
      onCancel={closeModal}
      onSave={update}
      item={editedItem}
      okTitle={STRINGS.save}
    />;
  }

  renderEditDataCubeModal(): JSX.Element {
    const { updateDataCube } = this.props;
    const editedItem = this.state.editedItem as DataCube;

    const EditionModal = NameDescriptionModal.specialize<DataCube>();

    const closeModal = () => {
      this.setState({
        editedItem: undefined
      });
    };

    return <EditionModal
      title={STRINGS.editDataCube}
      onCancel={closeModal}
      onSave={updateDataCube}
      item={editedItem}
      okTitle={STRINGS.save}
    />;
  }

  render() {
    const { user, onNavClick, onOpenAbout, customization } = this.props;
    const { showAddCollectionModal, editedItem } = this.state;

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
      {editedItem ? this.renderEditModal() : null}
    </div>;
  }
}
