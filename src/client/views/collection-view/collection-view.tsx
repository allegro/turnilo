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

import { Collection, User, Customization, CollectionItem, DataCube } from '../../../common/models/index';
import { Fn } from '../../../common/utils/general/general';

import { replaceHash } from '../../utils/url/url';

import { CollectionHeaderBar, Router, Route } from '../../components/index';

import { CollectionOverview } from './collection-overview/collection-overview';
import { CollectionItemLightbox } from './collection-item-lightbox/collection-item-lightbox';


export interface CollectionViewProps extends React.Props<any> {
  dataCubes: DataCube[];
  collections: Collection[];
  user?: User;
  onNavClick?: Fn;
  customization?: Customization;
  delegate?: {
    updateItem: (collection: Collection, collectionItem: CollectionItem) => void;
    editItem: (collection: Collection, collectionItem: CollectionItem) => void;
    createItem: (collection: Collection, dataCube: DataCube) => void;
    deleteItem: (collection: Collection, collectionItem: CollectionItem) => void;
  };
}

export interface CollectionViewState {
  collection?: Collection;
}

export class CollectionView extends React.Component<CollectionViewProps, CollectionViewState> {
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

    this.setState({collection});
  }

  render() {
    const { user, collections, customization, onNavClick, delegate, dataCubes } = this.props;
    const { collection } = this.state;

    const pump = (key: string, value: string): {key: string, value: any} => {
      if (key !== 'collectionId') return {key, value};

      return {
        key: 'collection',
        value: collections.filter(c => c.name === value)[0]
      };
    };

    return <div className="collection-view">
      <CollectionHeaderBar
        user={user}
        onNavClick={onNavClick}
        customization={customization}
        title={collection ? collection.title : ''}
        dataCubes={dataCubes}
        collections={collections}
        onAddItem={delegate ? delegate.createItem.bind(this, collection) : null}
      />

      <div className="main-panel">
        <Router onURLChange={this.onURLChange.bind(this)} rootFragment="collection">
          <Route fragment=":collectionId" alwaysShowOrphans={true}>
            <CollectionOverview collections={collections}/>

            <Route fragment=":itemId" transmit={['collectionId']} inflate={pump}>
              <CollectionItemLightbox
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
