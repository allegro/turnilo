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
import { CollectionItem, CollectionItemJS, CollectionItemContext } from '../collection-item/collection-item';

export interface CollectionValue {
  name: string;
  title?: string;
  description?: string;
  items: CollectionItem[];
}

export interface CollectionJS {
  name: string;
  title?: string;
  description?: string;
  items: CollectionItemJS[];
}

export type CollectionContext = CollectionItemContext;

var check: Class<CollectionValue, CollectionJS>;
export class Collection implements Instance<CollectionValue, CollectionJS> {

  static isCollection(candidate: any): candidate is Collection {
    return isInstanceOf(candidate, Collection);
  }

  static fromJS(parameters: CollectionJS, context?: CollectionContext): Collection {
    if (!context) throw new Error('Collection must have context');

    if (!parameters.name) throw new Error('Collection must have a name');

    var items: CollectionItemJS[] = parameters.items || (parameters as any).linkItems || [];

    return new Collection({
      title: parameters.title,
      name: parameters.name,
      description: parameters.description,
      items: items.map(linkItem => CollectionItem.fromJS(linkItem, context))
    });
  }

  public title: string;
  public name: string;
  public description: string;
  public items: CollectionItem[];

  constructor(parameters: CollectionValue) {
    this.title = parameters.title;
    this.name = parameters.name;
    this.items = parameters.items;
    this.description = parameters.description;
  }

  public valueOf(): CollectionValue {
    return {
      title: this.title,
      name: this.name,
      description: this.description,
      items: this.items
    };
  }

  public toJS(): CollectionJS {
    var o: CollectionJS = {
      name: this.name,
      items: this.items.map(linkItem => linkItem.toJS())
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
      immutableArraysEqual(this.items, other.items);
  }

  public getDefaultItem(): CollectionItem {
    return this.items[0];
  }

  public findByName(name: string): CollectionItem {
    return findByName(this.items, name);
  }

  public deleteItem(item: CollectionItem): Collection {
    var index = this.items.indexOf(item);

    if (index === -1) return this;

    var newItems = this.items.concat();
    newItems.splice(index, 1);

    return this.change('items', newItems);
  }

  public change(propertyName: string, newValue: any): Collection {
    var v = this.valueOf();

    if (!v.hasOwnProperty(propertyName)) {
      throw new Error(`Unknown property : ${propertyName}`);
    }

    (v as any)[propertyName] = newValue;
    return new Collection(v);
  }

  public updateItem(item: CollectionItem): Collection {
    var index = -1;

    this.items.forEach(({name}, i) => {
      if (name === item.name) {
        index = i;
        return;
      }
    });

    if (index === -1) {
      throw new Error(`Can't add unknown item : ${item.toString()}`);
    }

    var newItems = this.items.concat();

    newItems[index] = item;

    return this.change('items', newItems);
  }

}
check = Collection;
