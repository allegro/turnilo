require('./add-collection-modal.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Collection, Essence, CollectionItem, DataCube } from '../../../common/models/index';
import { classNames } from '../../utils/dom/dom';
import { generateUniqueName } from '../../../common/utils/string/string';

import { FormLabel, Button, ImmutableInput, Modal, Dropdown } from '../index';

import { COLLECTION as LABELS } from '../../../common/models/labels';

export interface AddCollectionModalProps extends React.Props<any> {
  collections: Collection[];
  onCancel?: () => void;
  onSave?: (collection: Collection) => void;
}

export interface AddCollectionModalState {
  collection?: Collection;
  errors?: any;
  canSave?: boolean;
}

export class AddCollectionModal extends React.Component<AddCollectionModalProps, AddCollectionModalState> {

  constructor() {
    super();
    this.state = {
      canSave: false,
      errors: {}
    };
  }

  initFromProps(props: AddCollectionModalProps) {
    this.setState({
      canSave: true,
      collection: new Collection({
        name: generateUniqueName('d', this.isNameUnique.bind(this)),
        items: [],
        title: 'New collection'
      })
    });
  }

  componentDidMount() {
    this.initFromProps(this.props);
  }

  save() {
    if (this.state.canSave) this.props.onSave(this.state.collection);
  }

  isNameUnique(name: string): boolean {
    const { collections } = this.props;

    if (collections.filter(c => c.name === name).length > 0) return false;

    return true;
  }

  updateErrors(path: string, isValid: boolean, error: string): {errors: any, canSave: boolean} {
    var { errors } = this.state;

    errors[path] = isValid ? false : error;

    var canSave = true;
    for (let key in errors) canSave = canSave && (errors[key] === false);

    return {errors, canSave};
  }

  onChange(newCollection: Collection, isValid: boolean, path: string, error: string) {
    var { errors, canSave } = this.updateErrors(path, isValid, error);

    if (isValid) {
      this.setState({
        errors,
        collection: newCollection,
        canSave
      });
    } else {
      this.setState({
        errors,
        canSave: false
      });
    }
  }

  render(): JSX.Element {
    const { canSave, errors, collection } = this.state;
    const { collections } = this.props;

    if (!collection) return null;

    var makeLabel = FormLabel.simpleGenerator(LABELS, errors, true);
    var makeTextInput = ImmutableInput.simpleGenerator(collection, this.onChange.bind(this));

    return <Modal
      className="add-collection-modal"
      title={collection.title}
      onClose={this.props.onCancel}
      onEnter={this.save.bind(this)}
    >
      <form className="general vertical">
        {makeLabel('title')}
        {makeTextInput('title', /^.+$/, true)}

        {makeLabel('description')}
        {makeTextInput('description')}

      </form>

      <div className="button-bar">
        <Button
          className={classNames("save", {disabled: !canSave})}
          title="Create"
          type="primary"
          onClick={this.save.bind(this)}
        />
        <Button className="cancel" title="Cancel" type="secondary" onClick={this.props.onCancel}/>
      </div>

    </Modal>;
  }
}
