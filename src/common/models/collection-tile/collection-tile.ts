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

import { Class, Instance, isInstanceOf } from 'immutable-class';
import { find } from 'plywood';
import { verifyUrlSafeName, makeTitle } from '../../utils/general/general';
import { DataCube } from '../data-cube/data-cube';
import { Essence, EssenceJS } from '../essence/essence';
import { Manifest } from '../manifest/manifest';

export interface CollectionTileValue {
  name: string;
  title: string;
  description: string;
  group: string;
  dataCube: DataCube;
  essence: Essence;
}

export interface CollectionTileJS {
  name: string;
  title?: string;
  description?: string;
  group: string;
  dataCube: string;
  essence: EssenceJS;
}

export interface CollectionTileContext {
  dataCubes: DataCube[];
  visualizations?: Manifest[];
}

var check: Class<CollectionTileValue, CollectionTileJS>;
export class CollectionTile implements Instance<CollectionTileValue, CollectionTileJS> {

  static isCollectionTile(candidate: any): candidate is CollectionTile {
    return isInstanceOf(candidate, CollectionTile);
  }

  static fromJS(parameters: CollectionTileJS, context?: CollectionTileContext): CollectionTile {
    if (!context) throw new Error('CollectionTile must have context');
    const { dataCubes, visualizations } = context;

    var dataCubeName = parameters.dataCube;
    var dataCube = find(dataCubes, d => d.name === dataCubeName);
    if (!dataCube) throw new Error(`can not find dataCube '${dataCubeName}'`);

    var essence = Essence.fromJS(parameters.essence, { dataCube, visualizations }).updateSplitsWithFilter();

    return new CollectionTile({
      name: parameters.name,
      title: parameters.title,
      description: parameters.description,
      group: parameters.group,
      dataCube,
      essence
    });
  }

  public name: string;
  public title: string;
  public description: string;
  public group: string;
  public dataCube: DataCube;
  public essence: Essence;

  constructor(parameters: CollectionTileValue) {
    var name = parameters.name;
    verifyUrlSafeName(name);
    this.name = name;
    this.title = parameters.title || makeTitle(name);
    this.description = parameters.description || '';
    this.group = parameters.group;
    this.dataCube = parameters.dataCube;
    this.essence = parameters.essence;
  }

  public valueOf(): CollectionTileValue {
    return {
      name: this.name,
      title: this.title,
      description: this.description,
      group: this.group,
      dataCube: this.dataCube,
      essence: this.essence
    };
  }

  public toJS(): CollectionTileJS {
    return {
      name: this.name,
      title: this.title,
      description: this.description,
      group: this.group,
      dataCube: this.dataCube.name,
      essence: this.essence.toJS()
    };
  }

  public toJSON(): CollectionTileJS {
    return this.toJS();
  }

  public toString(): string {
    return `[LinkItem: ${this.name}]`;
  }

  public equals(other: CollectionTile): boolean {
    return CollectionTile.isCollectionTile(other) &&
      this.name === other.name &&
      this.title === other.title &&
      this.description === other.description &&
      this.group === other.group &&
      this.dataCube.equals(other.dataCube) &&
      this.essence.equals(other.essence);
  }

  public change(propertyName: string, newValue: any): CollectionTile {
    var v = this.valueOf();

    if (!v.hasOwnProperty(propertyName)) {
      throw new Error(`Unknown property : ${propertyName}`);
    }

    (v as any)[propertyName] = newValue;
    return new CollectionTile(v);
  }

  public changeEssence(essence: Essence) {
    return this.change('essence', essence);
  }

  public changeName(name: string): CollectionTile {
    return this.change('name', name);
  }

  public changeTitle(title: string): CollectionTile {
    return this.change('title', title);
  }
}
check = CollectionTile;
