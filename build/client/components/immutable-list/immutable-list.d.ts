import { List } from "immutable";
import * as React from "react";
import { Fn } from "../../../common/utils/general/general";
import { SimpleRow } from "../simple-list/simple-list";
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
export declare class ImmutableList<T> extends React.Component<ImmutableListProps<T>, ImmutableListState<T>> {
    constructor(props: ImmutableListProps<T>);
    editItem: (index: number) => void;
    addItem: () => void;
    componentWillReceiveProps(nextProps: ImmutableListProps<T>): void;
    componentDidMount(): void;
    deleteItem: (index: number) => void;
    onReorder: (oldIndex: number, newIndex: number) => void;
    onChange(): void;
    renderEditModal(itemIndex: number): JSX.Element;
    renderAddModal(item: T): JSX.Element;
    render(): JSX.Element;
}
