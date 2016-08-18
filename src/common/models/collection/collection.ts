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

import { Class, Instance, isInstanceOf, immutableArraysEqual } from 'immutable-class';
import { findByName } from 'plywood';

import { Manifest } from '../manifest/manifest';
import { CollectionTile, CollectionTileJS, CollectionTileContext } from '../index';

export interface CollectionValue {
  name: string;
  title?: string;
  description?: string;
  tiles: CollectionTile[];
}

export interface CollectionJS {
  name: string;
  title?: string;
  description?: string;
  tiles?: CollectionTileJS[];

  // Backward comp, this shouldn't be used anymore
  items?: CollectionTileJS[];
}

export type CollectionContext = CollectionTileContext;

var check: Class<CollectionValue, CollectionJS>;
export class Collection implements Instance<CollectionValue, CollectionJS> {

  static isCollection(candidate: any): candidate is Collection {
    return isInstanceOf(candidate, Collection);
  }

  static fromJS(parameters: CollectionJS, context?: CollectionContext): Collection {
    if (!context) throw new Error('Collection must have context');

    if (!parameters.name) throw new Error('Collection must have a name');

    var tiles: CollectionTileJS[] = parameters.tiles || parameters.items || (parameters as any).linkItems || [];

    return new Collection({
      title: parameters.title,
      name: parameters.name,
      description: parameters.description,
      tiles: tiles.map(linkItem => CollectionTile.fromJS(linkItem, context))
    });
  }

  public title: string;
  public name: string;
  public description: string;
  public tiles: CollectionTile[];

  constructor(parameters: CollectionValue) {
    this.title = parameters.title;
    this.name = parameters.name;
    this.tiles = parameters.tiles;
    this.description = parameters.description;

    this.isNameAvailable = this.isNameAvailable.bind(this);
  }

  public valueOf(): CollectionValue {
    return {
      title: this.title,
      name: this.name,
      description: this.description,
      tiles: this.tiles
    };
  }

  public toJS(): CollectionJS {
    var o: CollectionJS = {
      name: this.name,
      tiles: this.tiles.map(linkItem => linkItem.toJS())
    };

    if (this.description) o.description = this.description;
    if (this.title) o.title = this.title;

    return o;
  }

  public toJSON(): CollectionJS {
    return this.toJS();
  }

  public toString(): string {
    return `[Collection: ${this.title}]`;
  }

  public equals(other: Collection): boolean {
    return Collection.isCollection(other) &&
      this.title === other.title &&
      this.name === other.name &&
      this.description === other.description &&
      immutableArraysEqual(this.tiles, other.tiles);
  }

  public getDefaultTile(): CollectionTile {
    return this.tiles[0];
  }

  public findByName(name: string): CollectionTile {
    return findByName(this.tiles, name);
  }

  public isNameAvailable(name: string): boolean {
    return !this.findByName(name);
  }

  public deleteTile(item: CollectionTile): Collection {
    var index = this.tiles.indexOf(item);

    if (index === -1) return this;

    var newTiles = this.tiles.concat();
    newTiles.splice(index, 1);

    return this.change('tiles', newTiles);
  }

  public change(propertyName: string, newValue: any): Collection {
    var v = this.valueOf();

    if (!v.hasOwnProperty(propertyName)) {
      throw new Error(`Unknown property : ${propertyName}`);
    }

    (v as any)[propertyName] = newValue;
    return new Collection(v);
  }

  public updateTile(tile: CollectionTile): Collection {
    var index = -1;

    this.tiles.forEach(({name}, i) => {
      if (name === tile.name) {
        index = i;
        return;
      }
    });

    if (index === -1) {
      throw new Error(`Can't add unknown tile : ${tile.toString()}`);
    }

    var newTiles = this.tiles.concat();

    newTiles[index] = tile;

    return this.change('tiles', newTiles);
  }

  public changeTiles(tiles: CollectionTile[]): Collection {
    return this.change('tiles', tiles);
  }

  public changeTitle(title: string): Collection {
    return this.change('title', title);
  }
}
check = Collection;
