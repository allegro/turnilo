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

require('./collection-view.css');

import * as React from 'react';
import * as Q from 'q';

import { Collection, User, Customization, CollectionItem, DataCube } from '../../../common/models/index';
import { Fn } from '../../../common/utils/general/general';

import { STRINGS } from '../../config/constants';

import { replaceHash } from '../../utils/url/url';
import { move } from '../../../common/utils/array/array';

import { CollectionHeaderBar, Router, Route, Notifier } from '../../components/index';

import { CollectionOverview } from './collection-overview/collection-overview';
import { CollectionItemLightbox } from './collection-item-lightbox/collection-item-lightbox';



export interface CollectionViewProps extends React.Props<any> {
  dataCubes: DataCube[];
  collections: Collection[];
  user?: User;
  onNavClick?: Fn;
  customization?: Customization;
  delegate?: {
    updateCollection: (collection: Collection) => Q.Promise<any>;
    deleteCollection: (collection: Collection) => Q.Promise<any>;
    updateItem: (collection: Collection, collectionItem: CollectionItem) => void;
    editItem: (collection: Collection, collectionItem: CollectionItem) => void;
    createItem: (collection: Collection, dataCube: DataCube) => void;
    deleteItem: (collection: Collection, collectionItem: CollectionItem) => void;
  };
}

export interface CollectionViewState {
  collection?: Collection;
  tempCollection?: Collection;
  editingOverview?: boolean;
}

export class CollectionView extends React.Component<CollectionViewProps, CollectionViewState> {
  private stickerId: number;

  constructor() {
    super();
    this.state = {};
  }

  onURLChange(crumbs: string[]) {
    const { collections } = this.props;
    var collection: Collection;

    if (crumbs.length === 0) {
      collection = collections[0];
      replaceHash(`#collection/${collection.name}`);
    } else {
      collection = collections.filter(({name}) => name === crumbs[0])[0];
    }

    this.setState({
      collection,
      editingOverview: false
    });
  }

  onItemsReorder(oldIndex: number, newIndex: number) {
    var tempCollection = this.state.tempCollection;

    var items = tempCollection.items.concat();

    move(items, oldIndex, newIndex);

    this.setState({
      tempCollection: tempCollection.changeItems(items)
    });
  }

  editCollection() {
    this.setState({
      editingOverview: true,
      tempCollection: new Collection(this.state.collection.valueOf())
    });

    this.stickerId = Notifier.stick(STRINGS.dragToReorder);
  }

  onCollectionTitleChange(newTitle: string) {
    this.setState({
      tempCollection: this.state.tempCollection.changeTitle(newTitle)
    });
  }

  saveEdition() {
    Notifier.removeSticker(this.stickerId);

    const { delegate } = this.props;
    const { tempCollection } = this.state;

    delegate
      .updateCollection(tempCollection)
      .then(() => {
        Notifier.success('Collection saved');
        this.setState({
          editingOverview: false,
          tempCollection: null,
          collection: tempCollection
        });
      });
  }

  cancelEdition() {
    Notifier.removeSticker(this.stickerId);

    this.setState({
      editingOverview: false,
      tempCollection: null
    });
  }

  render() {
    const { user, collections, customization, onNavClick, delegate, dataCubes } = this.props;
    const { collection, tempCollection, editingOverview } = this.state;

    const currentCollection = tempCollection || collection;

    const removeCollection = () => delegate.deleteCollection(collection);

    return <div className="collection-view">
      <CollectionHeaderBar
        user={user}
        onNavClick={onNavClick}
        customization={customization}
        title={currentCollection ? currentCollection.title : ''}
        dataCubes={dataCubes}
        collections={collections}
        onAddItem={delegate ? delegate.createItem.bind(this, collection) : null}
        onEditCollection={delegate ? this.editCollection.bind(this) : null}
        onDeleteCollection={delegate ? removeCollection : null}

        editionMode={editingOverview}
        onSave={this.saveEdition.bind(this)}
        onCancel={this.cancelEdition.bind(this)}
        onCollectionTitleChange={this.onCollectionTitleChange.bind(this)}
      />

      <div className="main-panel">
        <Router onURLChange={this.onURLChange.bind(this)} rootFragment="collection">
          <Route fragment=":collectionId" alwaysShowOrphans={true}>
            <CollectionOverview
              collection={currentCollection}
              editionMode={editingOverview}
              onReorder={this.onItemsReorder.bind(this)}
              onDelete={delegate ? delegate.deleteItem : null}
            />

            <Route fragment=":itemId">
              <CollectionItemLightbox
                collection={currentCollection}
                onChange={delegate ? delegate.updateItem : null}
                onEdit={delegate ? delegate.editItem : null}
                onDelete={delegate ? delegate.deleteItem : null}
              />
            </Route>

          </Route>

        </Router>
      </div>

    </div>;
  }
}
