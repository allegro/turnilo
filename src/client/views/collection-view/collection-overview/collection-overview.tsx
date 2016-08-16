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

import { setDragGhost, classNames, getYFromEvent, getXFromEvent } from '../../../utils/dom/dom';

export interface CollectionOverviewProps extends React.Props<any> {
  collection: Collection;
  collectionId?: string;
  onReorder?: (oldIndex: number, newIndex: number) => void;
  onDelete?: (collection: Collection, item: CollectionItem) => void;
  editionMode?: boolean;
}

export interface CollectionOverviewState {
  collection?: Collection;
  draggedItem?: CollectionItem;
  dropIndex?: number;
  dropAfter?: boolean;
}

export class CollectionOverview extends React.Component<CollectionOverviewProps, CollectionOverviewState> {
  constructor() {
    super();
    this.state = {
      dropIndex: -1
    };
  }

  onExpand(item: CollectionItem) {
    window.location.hash = `#collection/${this.props.collection.name}/${item.name}`;
  }

  dragStart(item: CollectionItem, e: __React.DragEvent) {
    this.setState({draggedItem: item});

    var dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = 'move';
    dataTransfer.setData("text/html", item.title);

    setDragGhost(dataTransfer, item.title);
  }

  shouldDropAfter(e: __React.DragEvent): boolean {
    var targetRect = (e.currentTarget as any).getBoundingClientRect();
    return getXFromEvent(e as any) - targetRect.left >= targetRect.width / 2;
  }

  dragOver(item: CollectionItem, e: __React.DragEvent) {
    e.preventDefault();

    const { collection } = this.props;
    const { draggedItem, dropIndex, dropAfter } = this.state;

    const items = collection.items;

    if (dropIndex === -1 && item === draggedItem) return;

    var sourceIndex = items.indexOf(draggedItem);
    var targetIndex = items.indexOf(item);
    var newDropIndex = targetIndex;
    var shouldDropAfter = this.shouldDropAfter(e);

    // Same tile
    if (newDropIndex === sourceIndex) {
      newDropIndex = -1;
    }

    // Tile right after but in its first horizontal half
    if (newDropIndex === sourceIndex + 1 && !shouldDropAfter) {
      newDropIndex = -1;
    }

    // Tile right before but in its last horizontal half
    if (newDropIndex === sourceIndex - 1 && shouldDropAfter) {
      newDropIndex = -1;
    }

    if (newDropIndex !== dropIndex || shouldDropAfter !== dropAfter) {
      this.setState({
        dropIndex: newDropIndex,
        dropAfter: shouldDropAfter
      });
    }
  }

  dragEnd(e: __React.DragEvent) {
    const { onReorder, collection } = this.props;
    var { draggedItem, dropIndex, dropAfter } = this.state;

    dropIndex = dropAfter || dropIndex === 0 ? dropIndex : dropIndex - 1;

    if (dropIndex > -1) onReorder(collection.items.indexOf(draggedItem), dropIndex);

    this.setState({
      draggedItem: undefined,
      dropIndex: -1,
      dropAfter: undefined
    });
  }

  renderItem(item: CollectionItem, i: number): JSX.Element {
    const { editionMode, onDelete, collection } = this.props;
    const { draggedItem, dropIndex, dropAfter } = this.state;

    const onDeleteClick = (item: CollectionItem) => onDelete(collection, item);

    const classes = classNames({
      dragged: draggedItem === item,
      'drop-before': dropIndex === i && !dropAfter,
      'drop-after': dropIndex === i && dropAfter
    });

    return <CollectionItemCard
      className={classes}
      item={item}
      key={item.name}
      onExpand={this.onExpand.bind(this)}
      onDragOver={this.dragOver.bind(this, item)}
      draggable={editionMode}
      onDragStart={this.dragStart.bind(this, item)}
      onDelete={onDeleteClick}
      editionMode={editionMode}
    />;
  }

  render() {
    const { collection } = this.props;

    if (!collection) return null;

    return <div
      className="collection-overview"
      onDragEnd={this.dragEnd.bind(this)}
    >
     {collection.items.map(this.renderItem, this)}
     <div className="collection-item-card empty"/>
    </div>;
  }
}
