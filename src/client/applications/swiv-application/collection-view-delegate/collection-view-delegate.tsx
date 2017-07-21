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

import * as React from 'react';
import * as Q from 'q';

import { SwivApplication, SwivApplicationProps, SwivApplicationState } from '../swiv-application';

import { Ajax } from '../../../utils/ajax/ajax';
import { Collection, CollectionTile, DataCube, Essence, Timekeeper, AppSettings } from '../../../../common/models/index';
import { generateUniqueName } from '../../../../common/utils/string/string';
import { STRINGS } from '../../../config/constants';
import { AddCollectionTileModal } from '../../../modals/index';
import { Notifier } from '../../../components/index';


export class CollectionViewDelegate {

  private app: SwivApplication;

  constructor(app: SwivApplication) {
    this.app = app;

    this.addCollection = this.addCollection.bind(this);
    this.addTile = this.addTile.bind(this);
    this.createTile = this.createTile.bind(this);
    this.deleteCollection = this.deleteCollection.bind(this);
    this.deleteTile = this.deleteTile.bind(this);
    this.duplicateTile = this.duplicateTile.bind(this);
    this.editTile = this.editTile.bind(this);
    this.updateCollection = this.updateCollection.bind(this);
    this.updateTile = this.updateTile.bind(this);
  }

  private setState(state: SwivApplicationState, callback?: () => void) {
    return this.app.setState.call(this.app, state, callback);
  }

  private save(appSettings: AppSettings): Q.Promise<any> {
    var deferred = Q.defer<string>();

    Ajax.query({
      method: "POST",
      url: 'collections',
      data: {
        collections: appSettings.toJS().collections || []
      }
    })
      .then(
        (status) => this.setState({appSettings}, deferred.resolve),
        (xhr: XMLHttpRequest) => {
          Notifier.failure('Woops', 'Something bad happened');
          deferred.reject(xhr.response);
        }
      ).done();

    return deferred.promise;
  }

  private getSettings(): AppSettings {
    return this.app.state.appSettings;
  }

  private getTimekeeper(): Timekeeper {
    return this.app.state.timekeeper;
  }

  addCollection(collection: Collection): Q.Promise<string> {
    return this
      .save(this.getSettings().addOrUpdateCollection(collection))
      .then(() => `#collection/${collection.name}`);
  }

  deleteTile(collection: Collection, tile: CollectionTile) {
    const appSettings = this.getSettings();
    const collectionURL = `#collection/${collection.name}`;
    const oldIndex = collection.tiles.indexOf(tile);

    const newCollection = collection.deleteTile(tile);
    const newSettings = appSettings.addOrUpdateCollection(newCollection);

    const undo = () => this.addTile(newCollection, tile, oldIndex);

    this.save(newSettings).then( () => {
      window.location.hash = collectionURL;
      Notifier.success('Tile removed', {label: STRINGS.undo, callback: undo});
    });
  }

  addTile(collection: Collection, tile: CollectionTile, index?: number): Q.Promise<string> {
    const appSettings = this.getSettings();

    var newTiles = collection.tiles;

    if (index !== undefined) {
      newTiles.splice(index, 0, tile);
    } else {
      newTiles.push(tile);
    }

    return this
      .save(appSettings.addOrUpdateCollection(collection.changeTiles(newTiles)))
      .then(() => `#collection/${collection.name}/${tile.name}`)
    ;
  }

  duplicateTile(collection: Collection, tile: CollectionTile): Q.Promise<string> {
    var newTile = new CollectionTile(tile.valueOf())
      .changeName(generateUniqueName('i', collection.isNameAvailable))
      .changeTitle(tile.title + ' (copy)')
      ;

    return this.addTile(collection, newTile);
  }

  createTile(collection: Collection, dataCube: DataCube) {
    const timekeeper = this.getTimekeeper();
    const collectionURL = `#collection/${collection.name}`;

    var onCancel = () => {
      this.setState({cubeViewSupervisor: undefined});
      window.location.hash = collectionURL;
    };

    var onSave = (_collection: Collection, CollectionTile: CollectionTile) => {
      this.setState({cubeViewSupervisor: undefined});
      this.addTile(_collection, CollectionTile).then(url => window.location.hash = `#collection/${_collection.name}`);
    };

    var getConfirmationModal = (newEssence: Essence) => {
      return <AddCollectionTileModal
        collection={collection}
        timekeeper={timekeeper}
        essence={newEssence}
        dataCube={dataCube}
        onSave={onSave}
      />;
    };

    this.setState({
      cubeViewSupervisor: {
        title: STRINGS.addVisualization + ': ' + collection.title,
        cancel: onCancel,
        getConfirmationModal: getConfirmationModal,
        saveLabel: STRINGS.add
      }
    }, () => window.location.hash = '#' + dataCube.name);
  }

  updateCollection(collection: Collection): Q.Promise<any> {
    const appSettings = this.getSettings();

    return this.save(appSettings.addOrUpdateCollection(collection));
  }

  deleteCollection(collection: Collection): Q.Promise<any> {
    const appSettings = this.getSettings();

    const oldIndex = appSettings.collections.indexOf(collection);

    const undo = () => {
      this.save(this.getSettings().addCollectionAt(collection, oldIndex));
    };

    return this.save(appSettings.deleteCollection(collection)).then( () => {
      window.location.hash = `#/home`;
      Notifier.success('Collection removed', {label: STRINGS.undo, callback: undo});
    });
  }

  updateTile(collection: Collection, tile: CollectionTile): Q.Promise<any> {
    const appSettings = this.getSettings();

    return this.save(appSettings.addOrUpdateCollection(collection.updateTile(tile)));
  }

  editTile(collection: Collection, tile: CollectionTile) {
    const appSettings = this.getSettings();
    const collectionURL = `#collection/${collection.name}/${tile.name}`;

    var onCancel = () => window.location.hash = collectionURL;

    var onSave = (newEssence: Essence) => {
      let newCollection = collection.updateTile(tile.changeEssence(newEssence));

      this.save(appSettings.addOrUpdateCollection(newCollection))
        .then(() => window.location.hash = collectionURL);
    };

    const { essence } = tile;

    this.setState({
      cubeViewSupervisor: {
        title: STRINGS.editVisualization + ': ' + collection.title + ' / ' + tile.title,
        cancel: onCancel,
        save: onSave
      }
    }, () => window.location.hash = `#${essence.dataCube.name}/${essence.toHash()}`);
  }
}
