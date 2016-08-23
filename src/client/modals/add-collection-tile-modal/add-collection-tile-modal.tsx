require('./add-collection-tile-modal.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Collection, Essence, Timekeeper, CollectionTile, DataCube, SortOn } from '../../../common/models/index';
import { classNames } from '../../utils/dom/dom';
import { generateUniqueName } from '../../../common/utils/string/string';

import { FormLabel, Button, ImmutableInput, Modal, Dropdown, Checkbox } from '../../components/index';

import { STRINGS } from '../../config/constants';

import { COLLECTION_ITEM as LABELS } from '../../../common/models/labels';

import { ImmutableFormDelegate, ImmutableFormState } from '../../utils/immutable-form-delegate/immutable-form-delegate';

export type CollectionMode = 'adding' | 'picking' | 'none';

export interface AddCollectionTileModalProps extends React.Props<any> {
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

  constructor() {
    super();
    this.delegate = new ImmutableFormDelegate<CollectionTile>(this);
  }

  getTitleFromEssence(essence: Essence): string {
    var splits = essence.splits;

    if (splits.length() === 0) return essence.selectedMeasures.map(m => {
      return essence.dataCube.getMeasure(m).title;
    }).join(', ');

    var dimensions: string[] = [];
    var measures: string[] = [];

    splits.forEach(split => {
      let dimension = split.getDimension(essence.dataCube.dimensions);
      let sortOn = SortOn.fromSortAction(split.sortAction, essence.dataCube, dimension);
      dimensions.push(dimension.title);
      measures.push(SortOn.getTitle(sortOn));
    });

    return `${dimensions.join(', ')} by ${measures.join(', ')}`;
  }

  initFromProps(props: AddCollectionTileModalProps) {
    const { collection, collections, essence, dataCube } = props;
    var collectionMode: CollectionMode = 'none';

    var selectedCollection: Collection;

    if (collections) {
      collectionMode = collections.length > 0 ? 'picking' : 'adding';
      selectedCollection = collections.length > 0 ? collections[0] : new Collection({
        name: generateUniqueName('c', () => true),
        tiles: [],
        title: 'New collection'
      });
    } else {
      selectedCollection = collection;
    }

    this.setState({
      canSave: !!selectedCollection,
      collection: selectedCollection,
      collectionMode,
      newInstance: new CollectionTile({
        name: generateUniqueName('i', this.isItemNameUnique.bind(this, selectedCollection)),
        title: this.getTitleFromEssence(essence),
        description: '',
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
        newInstance: newInstance.change('name', generateUniqueName('i', c.isNameAvailable))
      });
    };

    return <MyDropDown
      label="Collection"
      items={collections}
      selectedItem={collection}
      renderItem={c => c ? (c.title || '<no title>') : 'Pick a collection'}
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
      let newMode: CollectionMode = collectionMode === 'picking' ? 'adding' : 'picking';
      let collection: Collection = undefined;

      if (newMode === 'adding') {
        collection = new Collection({
          name: generateUniqueName('c', isCollectionNameUnique),
          tiles: [],
          title: 'New collection'
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
          'name',
          generateUniqueName('i', this.isItemNameUnique.bind(this, newCollection))
        )
      });
    };

    if (collectionMode === 'none') return null;

    if (collectionMode === 'picking') {
      return <div className="collection-picker">
        {this.renderCollectionDropdown()}
        <div className="new-collection" onClick={toggleCollectionMode}>Or add a new collection</div>
      </div>;
    } else {
      return <div className="collection-picker">
        { FormLabel.dumbLabel(`Collection title`) }
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

        { makeLabel('title') }
        { makeTextInput('title', /^.+$/, collectionMode !== 'adding') }

        { makeLabel('description') }
        { makeTextInput('description', /^.*$/) }

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
          className={classNames("save", {disabled: !canSave})}
          title="Add to collection"
          type="primary"
          onClick={this.save.bind(this)}
        />
        <Button className="cancel" title="Cancel" type="secondary" onClick={onCancel}/>
      </div>
    </Modal>;
  }
}
