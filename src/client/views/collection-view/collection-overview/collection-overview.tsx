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

require('./collection-overview.css');

import * as React from 'react';
import { Collection, CollectionItem } from '../../../../common/models/index';

import { CollectionItemCard } from '../collection-item-card/collection-item-card';


export interface CollectionOverviewProps extends React.Props<any> {
  collections: Collection[];
  collectionId?: string;
}

export interface CollectionOverviewState {
  collection?: Collection;
}

export class CollectionOverview extends React.Component<CollectionOverviewProps, CollectionOverviewState> {
  constructor() {
    super();
    this.state = {};
  }

  componentWillReceiveProps(nextProps: CollectionOverviewProps) {
    const { collections, collectionId } = nextProps;

    if (collections && collectionId) {
      this.setState({
        collection: collections.filter(({name}) => collectionId === name)[0]
      });
    }
  }

  onExpand(item: CollectionItem) {
    window.location.hash = `#collection/${this.state.collection.name}/${item.name}`;
  }

  renderItem(item: CollectionItem, i: number): JSX.Element {
    return <CollectionItemCard
      item={item}
      key={item.name}
      // key={`${item.name}-${i}`}
      onExpand={this.onExpand.bind(this)}
    />;
  }

  render() {
    const { collection } = this.state;

    if (!collection) return null;

    return <div className="collection-overview">
     {collection.items.map(this.renderItem, this)}
     <div className="collection-item-card empty"/>
    </div>;
  }
}
