require('./add-collection-modal.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, Expression, Executor, Dataset } from 'plywood';
import { Collection, Essence, CollectionTile, DataCube } from '../../../common/models/index';
import { classNames } from '../../utils/dom/dom';
import { ImmutableFormDelegate, ImmutableFormState } from '../../utils/immutable-form-delegate/immutable-form-delegate';
import { generateUniqueName } from '../../../common/utils/string/string';

import { FormLabel, Button, ImmutableInput, Modal, Dropdown } from '../../components/index';

import { STRINGS } from '../../config/constants';

import { COLLECTION as LABELS } from '../../../common/models/labels';

export interface AddCollectionModalProps extends React.Props<any> {
  collections: Collection[];
  onCancel?: () => void;
  onSave?: (collection: Collection) => void;
}

export class AddCollectionModal extends React.Component<AddCollectionModalProps, ImmutableFormState<Collection>> {

  private delegate: ImmutableFormDelegate<Collection>;

  constructor() {
    super();

    this.delegate = new ImmutableFormDelegate(this);
  }

  initFromProps(props: AddCollectionModalProps) {
    this.setState({
      canSave: true,
      newInstance: new Collection({
        name: generateUniqueName('c', this.isNameUnique.bind(this)),
        tiles: [],
        title: 'New collection'
      })
    });
  }

  componentDidMount() {
    this.initFromProps(this.props);
  }

  save() {
    if (this.state.canSave) this.props.onSave(this.state.newInstance);
  }

  isNameUnique(name: string): boolean {
    const { collections } = this.props;

    if (collections.filter(c => c.name === name).length > 0) return false;

    return true;
  }

  render(): JSX.Element {
    const { canSave, errors, newInstance } = this.state;
    const { collections } = this.props;

    if (!newInstance) return null;

    var makeLabel = FormLabel.simpleGenerator(LABELS, errors, true);
    var makeTextInput = ImmutableInput.simpleGenerator(newInstance, this.delegate.onChange);

    return <Modal
      className="add-collection-modal"
      title={STRINGS.addNewCollection}
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
