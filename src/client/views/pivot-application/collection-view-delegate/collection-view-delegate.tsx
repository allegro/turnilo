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
import * as Qajax from 'qajax';
import * as Q from 'q';

import { PivotApplication, PivotApplicationProps, PivotApplicationState } from '../pivot-application.tsx';

import { Collection, CollectionItem, DataCube, Essence, AppSettings } from '../../../../common/models/index';
import { STRINGS } from '../../../config/constants';
import { Notifier, AddCollectionItemModal } from '../../../components/index';

export class CollectionViewDelegate {

  private app: PivotApplication;

  constructor(app: PivotApplication) {
    this.app = app;

    this.deleteItem = this.deleteItem.bind(this);
    this.createItem = this.createItem.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.editItem = this.editItem.bind(this);
  }

  private setState(state: PivotApplicationState, callback?: () => any) {
    return this.app.setState.bind(this.app)(state, callback);
  }

  private save(appSettings: AppSettings, callback?: () => void) {
    this.setState({appSettings}, callback);

    // var { version } = this.app.props;

    // Qajax({
    //   method: "POST",
    //   url: 'settings',
    //   data: {version, appSettings}
    // })
    //   .then(Qajax.filterSuccess)
    //   .then(Qajax.toJSON)
    //   .then(
    //     (status) => {
    //       this.setState({appSettings}, callback);
    //       // Notifier.success('Collections saved');
    //     },
    //     (xhr: XMLHttpRequest) => {
    //       Notifier.failure('Woops', 'Something bad happened');
    //     }
    //   ).done();
  }

  private getSettings(): AppSettings {
    return this.app.state.appSettings;
  }

  addCollection(collection: Collection): Q.Promise<string> {
    var deferred = Q.defer<string>();

    const appSettings = this.getSettings();

    this.save(
      appSettings.addOrUpdateCollection(collection),
      () => deferred.resolve(`#collection/${collection.name}`)
    );

    return deferred.promise;
  }

  deleteItem(collection: Collection, collectionItem: CollectionItem) {
    const appSettings = this.getSettings();
    const collectionURL = `#collection/${collection.name}`;
    const oldIndex = collection.items.indexOf(collectionItem);

    const newCollection = collection.deleteItem(collectionItem);
    const newSettings = appSettings.addOrUpdateCollection(newCollection);

    const undo = () => this.addItem(newCollection, collectionItem, oldIndex);

    this.save(newSettings, () => {
      window.location.hash = collectionURL;
      Notifier.success('Item removed', undefined, 3, {label: STRINGS.undo, callback: undo});
    });
  }

  addItem(collection: Collection, collectionItem: CollectionItem, index?: number): Q.Promise<string> {
    var deferred = Q.defer<string>();

    const appSettings = this.getSettings();

    var newItems = collection.items;

    if (index !== undefined) {
      newItems.splice(index, 0, collectionItem);
    } else {
      newItems.push(collectionItem);
    }

    this.save(
      appSettings.addOrUpdateCollection(collection.change('items', newItems)),
      () => deferred.resolve(`#collection/${collection.name}/${collectionItem.name}`)
    );

    return deferred.promise;
  }

  createItem(collection: Collection, dataCube: DataCube) {
    const appSettings = this.getSettings();
    const collectionURL = `#collection/${collection.name}`;

    var onCancel = () => {
      this.setState({cubeViewSupervisor: undefined});
      window.location.hash = collectionURL;
    };

    var onSave = (_collection: Collection, collectionItem: CollectionItem) => {
      this.setState({cubeViewSupervisor: undefined});
      this.addItem(_collection, collectionItem).then(url => window.location.hash = url);
    };

    var getConfirmationModal = (newEssence: Essence) => {
      return <AddCollectionItemModal
        collection={collection}
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

  updateItem(collection: Collection, item: CollectionItem) {
    const appSettings = this.getSettings();

    this.save(appSettings.addOrUpdateCollection(collection.updateItem(item)));
  }

  editItem(collection: Collection, item: CollectionItem) {
    const appSettings = this.getSettings();
    const collectionURL = `#collection/${collection.name}/${item.name}`;

    var onCancel = () => window.location.hash = collectionURL;

    var onSave = (newEssence: Essence) => {
      let newCollection = collection.updateItem(item.changeEssence(newEssence));

      this.save(
        appSettings.addOrUpdateCollection(newCollection),
        () => window.location.hash = collectionURL
      );
    };

    const { essence } = item;

    this.setState({
      cubeViewSupervisor: {
        title: STRINGS.editVisualization + ': ' + collection.title + ' / ' + item.title,
        cancel: onCancel,
        save: onSave
      }
    }, () => window.location.hash = `#${essence.dataCube.name}/${essence.toHash()}`);
  }
}
