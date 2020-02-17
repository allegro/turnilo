/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { List } from "immutable";
import * as React from "react";
import { Fn } from "../../../common/utils/general/general";
import { SimpleList, SimpleRow } from "../simple-list/simple-list";
import "./immutable-list.scss";

export interface ImmutableListProps<T> {
  label?: string;
  items: List<T>;
  onChange: (newItems: List<T>) => void;
  getNewItem: () => T;
  getModal: (item: T) => JSX.Element;
  getRows: (items: List<T>) => SimpleRow[];
  toggleSuggestions?: Fn;
}

export interface ImmutableListState<T> {
  tempItems?: List<T>;
  editedIndex?: number;
  pendingAddItem?: T;
}

export class ImmutableList<T> extends React.Component<ImmutableListProps<T>, ImmutableListState<T>> {

  constructor(props: ImmutableListProps<T>) {
    super(props);
    this.state = {};
  }

  editItem = (index: number) => {
    this.setState({ editedIndex: index });
  };

  addItem = () => {
    this.setState({ pendingAddItem: this.props.getNewItem() });
  };

  componentWillReceiveProps(nextProps: ImmutableListProps<T>) {
    if (nextProps.items) {
      this.setState({ tempItems: nextProps.items });
    }
  }

  componentDidMount() {
    if (this.props.items) {
      this.setState({ tempItems: this.props.items });
    }
  }

  deleteItem = (index: number) => {
    const { tempItems } = this.state;
    this.setState({ tempItems: tempItems.delete(index) }, this.onChange);
  };

  onReorder = (oldIndex: number, newIndex: number) => {
    var tempItems: List<any> = this.state.tempItems;

    var item = tempItems.get(oldIndex);

    this.setState({
      tempItems: tempItems
        .delete(oldIndex)
        .insert(newIndex > oldIndex ? newIndex - 1 : newIndex, item)
    }, this.onChange);
  };

  onChange() {
    this.props.onChange(this.state.tempItems);
  }

  renderEditModal(itemIndex: number): JSX.Element {
    const { tempItems } = this.state;

    var item = tempItems.get(itemIndex);

    var onSave = (newItem: T) => {
      const newItems = tempItems.update(itemIndex, () => newItem);
      this.setState({ tempItems: newItems, editedIndex: undefined }, this.onChange);
    };

    var onClose = () => this.setState({ editedIndex: undefined });

    return React.cloneElement(this.props.getModal(item), { onSave, onClose });
  }

  renderAddModal(item: T): JSX.Element {
    var onSave = (newItem: T) => {
      const { tempItems } = this.state;
      const newItems = tempItems.push(newItem);

      this.setState(
        { tempItems: newItems, pendingAddItem: null },
        this.onChange
      );
    };

    var onClose = () => this.setState({ pendingAddItem: null });

    return React.cloneElement(this.props.getModal(item), { onSave, onClose });
  }

  render() {
    const { items, getRows, label, toggleSuggestions } = this.props;
    const { editedIndex, pendingAddItem } = this.state;

    if (!items) return null;
    return <div className="immutable-list">
      <div className="list-title">
        <div className="label">{label}</div>
        <div className="actions">
          {toggleSuggestions ? <button key="suggestions" onClick={toggleSuggestions}>Suggestions</button> : null}
          <button key="add" onClick={this.addItem}>Add item</button>
        </div>
      </div>
      <SimpleList
        rows={getRows(items)}
        onEdit={this.editItem}
        onRemove={this.deleteItem}
        onReorder={this.onReorder}
      />
      {editedIndex !== undefined ? this.renderEditModal(editedIndex) : null}
      {pendingAddItem ? this.renderAddModal(pendingAddItem) : null}
    </div>;
  }
}
