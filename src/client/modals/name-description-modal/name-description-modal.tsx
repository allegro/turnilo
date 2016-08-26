require('./name-description-modal.css');

import * as React from 'react';

import { $, Expression, Executor, Dataset } from 'plywood';
import { Collection, Essence, CollectionTile, DataCube } from '../../../common/models/index';
import { classNames } from '../../utils/dom/dom';
import { ImmutableFormDelegate, ImmutableFormState } from '../../utils/immutable-form-delegate/immutable-form-delegate';

import { FormLabel, Button, ImmutableInput, Modal, Dropdown } from '../../components/index';

import { STRINGS } from '../../config/constants';

import { COLLECTION as LABELS } from '../../../common/models/labels';

export interface NameDescriptionModalProps<T> extends React.Props<any> {
  onCancel?: () => void;
  onSave?: (newItem: T) => void;
  item: T;
  title: string;
  okTitle: string;
}

export class NameDescriptionModal<T> extends React.Component<NameDescriptionModalProps<T>, ImmutableFormState<T>> {

  static specialize<U>() {
    return NameDescriptionModal as { new (): NameDescriptionModal<U>; };
  }

  private delegate: ImmutableFormDelegate<T>;

  constructor() {
    super();

    this.delegate = new ImmutableFormDelegate(this);
  }

  initFromProps(props: NameDescriptionModalProps<T>) {
    if (!props.item) return;

    this.setState({
      canSave: true,
      newInstance: props.item
    });
  }

  componentDidMount() {
    this.initFromProps(this.props);
  }

  save() {
    if (this.state.canSave) this.props.onSave(this.state.newInstance);
  }

  render(): JSX.Element {
    const { title, okTitle } = this.props;
    const { canSave, errors, newInstance } = this.state;

    if (!newInstance) return null;

    var makeLabel = FormLabel.simpleGenerator(LABELS, errors, true);
    var makeTextInput = ImmutableInput.simpleGenerator(newInstance, this.delegate.onChange);

    return <Modal
      className="name-description-modal"
      title={title}
      onClose={this.props.onCancel}
      onEnter={this.save.bind(this)}
    >
      <form className="general vertical">
        {makeLabel('title')}
        {makeTextInput('title', /.*/, true)}

        {makeLabel('description')}
        {makeTextInput('description', /.*/)}

      </form>

      <div className="button-bar">
        <Button
          className={classNames("save", {disabled: !canSave})}
          title={okTitle}
          type="primary"
          onClick={this.save.bind(this)}
        />
        <Button className="cancel" title="Cancel" type="secondary" onClick={this.props.onCancel}/>
      </div>

    </Modal>;
  }
}
