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
import { Collection, CollectionTile } from '../../../../common/models/index';
import { SvgIcon } from '../../../components/index';

import { CollectionTileCard } from '../collection-tile-card/collection-tile-card';

import { setDragGhost, classNames, getYFromEvent, getXFromEvent } from '../../../utils/dom/dom';

export interface CollectionOverviewProps extends React.Props<any> {
  collection: Collection;
  collectionId?: string;
  onReorder?: (oldIndex: number, newIndex: number) => void;
  onDelete?: (collection: Collection, tile: CollectionTile) => void;
  editionMode?: boolean;
}

export interface CollectionOverviewState {
  collection?: Collection;
  draggedTile?: CollectionTile;
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

  onExpand(tile: CollectionTile) {
    window.location.hash = `#collection/${this.props.collection.name}/${tile.name}`;
  }

  dragStart(tile: CollectionTile, e: __React.DragEvent) {
    this.setState({draggedTile: tile});

    var dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = 'move';
    dataTransfer.setData("text/html", tile.title);

    setDragGhost(dataTransfer, tile.title);
  }

  shouldDropAfter(e: __React.DragEvent): boolean {
    var targetRect = (e.currentTarget as any).getBoundingClientRect();
    return getXFromEvent(e as any) - targetRect.left >= targetRect.width / 2;
  }

  dragOver(tile: CollectionTile, e: __React.DragEvent) {
    e.preventDefault();

    const { collection } = this.props;
    const { draggedTile, dropIndex, dropAfter } = this.state;

    const tiles = collection.tiles;

    if (dropIndex === -1 && tile === draggedTile) return;

    var sourceIndex = tiles.indexOf(draggedTile);
    var targetIndex = tiles.indexOf(tile);
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
    var { draggedTile, dropIndex, dropAfter } = this.state;

    dropIndex = dropAfter || dropIndex === 0 ? dropIndex : dropIndex - 1;

    if (dropIndex > -1) onReorder(collection.tiles.indexOf(draggedTile), dropIndex);

    this.setState({
      draggedTile: undefined,
      dropIndex: -1,
      dropAfter: undefined
    });
  }

  renderTile(tile: CollectionTile, i: number): JSX.Element {
    const { editionMode, onDelete, collection } = this.props;
    const { draggedTile, dropIndex, dropAfter } = this.state;

    const onDeleteClick = (tile: CollectionTile) => onDelete(collection, tile);

    const classes = classNames({
      dragged: draggedTile === tile,
      'drop-before': dropIndex === i && !dropAfter,
      'drop-after': dropIndex === i && dropAfter
    });

    return <CollectionTileCard
      className={classes}
      tile={tile}
      key={tile.name}
      onExpand={this.onExpand.bind(this)}
      onDragOver={this.dragOver.bind(this, tile)}
      draggable={editionMode}
      onDragStart={this.dragStart.bind(this, tile)}
      onDelete={onDeleteClick}
      editionMode={editionMode}
    />;
  }

  renderEmpty() {
    return <div
      className="collection-overview empty"
    >
    <div className="container">
      <SvgIcon svg={require(`../../../icons/full-collection.svg`)}/>
      <div className="placeholder">There are no views in this collection</div>
    </div>
    </div>;
  }

  render() {
    const { collection } = this.props;

    if (!collection) return null;

    if (!collection.tiles.length) return this.renderEmpty();

    return <div
      className="collection-overview"
      onDragEnd={this.dragEnd.bind(this)}
    >
     {collection.tiles.map(this.renderTile, this)}
     <div className="collection-tile-card empty"/>
    </div>;
  }
}
