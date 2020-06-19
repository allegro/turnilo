import * as React from "react";
import { ListItem } from "../../../common/models/list-item/list-item";
import { ChangeFn } from "../../utils/immutable-form-delegate/immutable-form-delegate";
import "./immutable-dropdown.scss";
export interface ImmutableDropdownProps<T> {
    instance: any;
    path: string;
    label?: string;
    items: T[];
    equal: (a: T, b: T) => boolean;
    renderItem: (a: T) => string;
    keyItem: (a: T) => any;
    onChange: ChangeFn;
}
export interface ImmutableDropdownState {
}
export declare class ImmutableDropdown<T> extends React.Component<ImmutableDropdownProps<T>, ImmutableDropdownState> {
    static simpleGenerator(instance: any, changeFn: ChangeFn): (name: string, items: ListItem[]) => JSX.Element;
    onChange: (newSelectedItem: T) => void;
    render(): JSX.Element;
}
