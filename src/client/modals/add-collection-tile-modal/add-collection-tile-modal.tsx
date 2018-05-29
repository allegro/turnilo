/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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

import "./add-collection-tile-modal.scss";

import * as React from "react";
import { Collection, CollectionTile, DataCube, Essence, Timekeeper } from "../../../common/models/index";
import { generateUniqueName } from "../../../common/utils/string/string";
import { classNames } from "../../utils/dom/dom";

import { Button, Checkbox, Dropdown, FormLabel, ImmutableInput, Modal } from "../../components/index";

import { STRINGS } from "../../config/constants";

import { COLLECTION_ITEM as LABELS } from "../../../common/models/labels";

import { ImmutableFormDelegate, ImmutableFormState } from "../../utils/immutable-form-delegate/immutable-form-delegate";

export type CollectionMode = "adding" | "picking" | "none";

export interface AddCollectionTileModalProps {
  essence: Essence;
  timekeeper: Timekeeper;

  // If collection is populated, onSave is called with it and the new item
  // Else if the collections property is defined, the modal will ask the user
  // to either pick a collection or to create one.
  collection?: Collection;
  collections?: Collection[];

  dataCube: DataCube;
  onCancel?: () => void;
  onSave?: (collection: Collection, tile: CollectionTile) => void;
}

export interface AddCollectionTileModalState extends ImmutableFormState<CollectionTile> {
  collection?: Collection;
  collectionMode?: CollectionMode;
  convertToFixedTime?: boolean;
}

export class AddCollectionTileModal extends React.Component<AddCollectionTileModalProps, AddCollectionTileModalState> {

  private delegate: ImmutableFormDelegate<CollectionTile>;

  constructor(props: AddCollectionTileModalProps) {
    super(props);
    this.delegate = new ImmutableFormDelegate<CollectionTile>(this);
  }

  getTitleFromEssence(essence: Essence): string {
    var ret = essence.splits
      .toArray()
      .map(split => {
        let dimension = split.getDimension(essence.dataCube.dimensions);
        return dimension.title;
      })
      .join(", ") || "Total";

    var measures = essence.getEffectiveMeasures();
    if (measures.size === 1) {
      ret = `${ret} by ${measures.get(0).title}`;
    }

    return ret;
  }

  initFromProps(props: AddCollectionTileModalProps) {
    const { collection, collections, essence, dataCube } = props;
    var collectionMode: CollectionMode = "none";

    var selectedCollection: Collection;

    if (collections) {
      collectionMode = collections.length > 0 ? "picking" : "adding";
      selectedCollection = collections.length > 0 ? collections[0] : new Collection({
        name: generateUniqueName("c", () => true),
        tiles: [],
        title: "New collection"
      });
    } else {
      selectedCollection = collection;
    }

    this.setState({
      canSave: !!selectedCollection,
      collection: selectedCollection,
      collectionMode,
      newInstance: new CollectionTile({
        name: generateUniqueName("i", this.isItemNameUnique.bind(this, selectedCollection)),
        title: this.getTitleFromEssence(essence),
        description: "",
        essence,
        group: null,
        dataCube
      })
    });
  }

  componentDidMount() {
    this.initFromProps(this.props);
  }

  componentWillReceiveProps(nextProps: AddCollectionTileModalProps) {
    if (!this.state.newInstance) this.initFromProps(nextProps);
  }

  save() {
    const { canSave, collection, newInstance } = this.state;
    if (canSave && this.props.onSave) this.props.onSave(collection, newInstance);
  }

  isItemNameUnique(collection: Collection, name: string): boolean {
    if (!collection) return true;

    if (collection.tiles.filter(tile => tile.name === name).length > 0) {
      return false;
    }

    return true;
  }

  renderCollectionDropdown(): JSX.Element {
    const { collection, newInstance } = this.state;
    const { collections } = this.props;

    if (!collections || collections.length === 0)  return null;

    const MyDropDown = Dropdown.specialize<Collection>();

    const setCollection = (c: Collection) => {
      this.setState({
        collection: c,
        newInstance: newInstance.change("name", generateUniqueName("i", c.isNameAvailable))
      });
    };

    return <MyDropDown
      label="Collection"
      items={collections}
      selectedItem={collection}
      renderItem={c => c ? (c.title || "<no title>") : "Pick a collection"}
      keyItem={c => c.name}
      onSelect={setCollection}
    />;
  }

  renderCollectionPicker() {
    const { collections } = this.props;
    const { newInstance, collection, collectionMode } = this.state;

    const isCollectionNameUnique = (name: string) => {
      return collections.filter(c => c.name === name).length === 0;
    };

    const toggleCollectionMode = () => {
      let newMode: CollectionMode = collectionMode === "picking" ? "adding" : "picking";
      let collection: Collection;

      if (newMode === "adding") {
        collection = new Collection({
          name: generateUniqueName("c", isCollectionNameUnique),
          tiles: [],
          title: "New collection"
        });
      } else {
        collection = collections[0];
      }

      this.setState({
        collectionMode: newMode,
        collection
      });
    };

    const onCollectionChange = (newCollection: Collection) => {
      this.setState({
        collection: newCollection,
        newInstance: newInstance.change(
          "name",
          generateUniqueName("i", this.isItemNameUnique.bind(this, newCollection))
        )
      });
    };

    if (collectionMode === "none") return null;

    if (collectionMode === "picking") {
      return <div className="collection-picker">
        {this.renderCollectionDropdown()}
        <div className="new-collection" onClick={toggleCollectionMode}>Or add a new collection</div>
      </div>;
    } else {
      return <div className="collection-picker">
        { FormLabel.dumbLabel("Collection title") }
        <ImmutableInput
          className="actionable"
          instance={collection}
          path="title"
          onChange={onCollectionChange}
          focusOnStartUp={true}
        />
        { collections.length > 0 ?
          <div className="new-collection" onClick={toggleCollectionMode}>Or pick an existing collection</div>
        : <div className="new-collection disabled">This will be a new collection</div> }
      </div>;
    }
  }

  toggleConvertToFixed() {
    const { essence, timekeeper } = this.props;
    var { newInstance } = this.state;
    const convertToFixedTime = !this.state.convertToFixedTime;

    if (convertToFixedTime && essence.filter.isRelative()) {
      newInstance = newInstance.changeEssence(essence.convertToSpecificFilter(timekeeper));
    } else {
      newInstance = newInstance.changeEssence(essence);
    }

    this.setState({
      convertToFixedTime,
      newInstance
    });
  }

  render(): JSX.Element {
    const { canSave, errors, newInstance, collectionMode, convertToFixedTime } = this.state;
    const { collections, onCancel, essence } = this.props;

    if (!newInstance) return null;

    var makeLabel = FormLabel.simpleGenerator(LABELS, errors, true);
    var makeTextInput = ImmutableInput.simpleGenerator(newInstance, this.delegate.onChange);

    const isRelative = essence.filter.isRelative();

    return <Modal
      className="add-collection-tile-modal"
      title={STRINGS.addNewTile}
      onClose={onCancel}
      onEnter={this.save.bind(this)}
    >
      <form className="general vertical">
        { this.renderCollectionPicker() }

        { makeLabel("title") }
        { makeTextInput("title", /^.+$/, collectionMode !== "adding") }

        { makeLabel("description") }
        { makeTextInput("description", /^.*$/) }

        { isRelative ?
          <Checkbox
            selected={convertToFixedTime}
            onClick={this.toggleConvertToFixed.bind(this)}
            label={STRINGS.convertToFixedTime}
          />
        : null }

      </form>

      <div className="button-bar">
        <Button
          className={classNames("save", { disabled: !canSave })}
          title="Add to collection"
          type="primary"
          onClick={this.save.bind(this)}
        />
        <Button className="cancel" title="Cancel" type="secondary" onClick={onCancel}/>
      </div>
    </Modal>;
  }
}
