require('./immutable-list.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { List } from 'immutable';

import { Button } from '../button/button';
import { Modal } from '../modal/modal';
import { SvgIcon } from '../svg-icon/svg-icon';
import { FormLabel } from '../form-label/form-label';
import { SimpleList, SimpleRow } from '../simple-list/simple-list';

export interface ImmutableListProps<T> extends React.Props<any> {
  items: List<T>;
  onChange: (newItems: List<T>) => void;
  getNewItem: (name: string) => T;
  getModal: (item: T) => JSX.Element;
  getRows: (items: List<T>) => SimpleRow[];
}

export interface ImmutableListState<T> {
  tempItems?: List<T>;
  editedIndex?: number;
  nameNeeded?: boolean;
  tempName?: string;
  pendingAddItem?: T;
}

export class ImmutableList<T> extends React.Component<ImmutableListProps<T>, ImmutableListState<T>> {

  // Allows usage in TSX :
  // const MyList = ImmutableList.specialize<MyImmutableClass>();
  // then : <MyList ... />
  static specialize<U>() {
    return ImmutableList as { new (): ImmutableList<U>; };
  }

  constructor() {
    super();
    this.state = {};
  }

  editItem(index: number) {
    this.setState({editedIndex: index});
  }

  addItem() {
    this.setState({nameNeeded: true, tempName: ''});
  }

  componentWillReceiveProps(nextProps: ImmutableListProps<T>) {
    if (nextProps.items) {
      this.setState({tempItems: nextProps.items});
    }
  }

  componentDidMount() {
    if (this.props.items) {
      this.setState({tempItems: this.props.items});
    }
  }

  deleteItem(index: number) {
    const { tempItems } = this.state;
    this.setState({tempItems: tempItems.delete(index)}, this.onChange);
  }

  onChange() {
    this.props.onChange(this.state.tempItems);
  }

  renderEditModal(dimensionIndex: number): JSX.Element {
    const { tempItems } = this.state;

    var dimension = tempItems.get(dimensionIndex);

    var onSave = (newDimension: T) => {
      const newItems = tempItems.update(dimensionIndex, () => newDimension);
      this.setState({tempItems: newItems, editedIndex: undefined}, this.onChange);
    };

    var onClose = () => this.setState({editedIndex: undefined});

    return React.cloneElement(this.props.getModal(dimension), {onSave, onClose});
  }

  renderAddModal(dimension: T): JSX.Element {
    var onSave = (newDimension: T) => {
      const { tempItems } = this.state;
      const newItems = tempItems.push(newDimension);

      this.setState(
        {tempItems: newItems, pendingAddItem: null},
        this.onChange
      );
    };

    var onClose = () => this.setState({pendingAddItem: null});

    return React.cloneElement(this.props.getModal(dimension), {onSave, onClose});
  }

  renderNameModal(): JSX.Element {
    var canSave = true;
    const { tempName } = this.state;

    const onChange = (e: React.FormEvent) => {
      this.setState({tempName: (e.target as HTMLInputElement).value});
    };

    const onOk = () => {
      this.setState({
        tempName: '',
        nameNeeded: false,
        pendingAddItem: this.props.getNewItem(this.state.tempName)
      });
    };

    const onCancel = () => this.setState({nameNeeded: false, tempName: ''});

    return <Modal
      className="dimension-modal"
      title="Please give a name to this new dimension"
      onClose={onCancel}
      onEnter={onOk}
      startUpFocusOn={'focus-me'}
    >
      <form className="general vertical">
        <FormLabel label="Name"></FormLabel>
        <input id="focus-me" type="text" onChange={onChange} value={tempName}/>
      </form>

      <div className="button-group">
        {canSave ? <Button className="ok" title="OK" type="primary" onClick={onOk}/> : null}
        <Button className="cancel" title="Cancel" type="secondary" onClick={onCancel}/>
      </div>

    </Modal>;
  }

  render() {
    const { items, getRows } = this.props;
    const { editedIndex, pendingAddItem, nameNeeded } = this.state;

    if (!items) return null;

    return <div className="dimensions-list">
      <div className="list-title">
        <div className="label">Dimensions</div>
        <div className="actions">
          <button>Introspect</button>
          <button onClick={this.addItem.bind(this)}>Add item</button>
        </div>
      </div>
      <SimpleList
        rows={getRows(items)}
        onEdit={this.editItem.bind(this)}
        onRemove={this.deleteItem.bind(this)}
      />
      {editedIndex !== undefined ? this.renderEditModal(editedIndex) : null}
      {pendingAddItem ? this.renderAddModal(pendingAddItem) : null}
      {nameNeeded ? this.renderNameModal() : null}
    </div>;
  }
}
