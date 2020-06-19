import * as React from "react";
import { JSXNode } from "../../utils/dom/dom";
import "./dropdown.scss";
export interface DropdownProps<T> {
    label?: string;
    items: T[];
    className?: string;
    menuClassName?: string;
    selectedItem?: T;
    equal?: (item1: T, item2: T) => boolean;
    renderItem?: (item: T) => JSXNode;
    renderSelectedItem?: (item: T) => JSXNode;
    keyItem?: (item: T) => string;
    onSelect?: (item: T) => void;
    direction?: string;
}
export interface DropdownState {
    open: boolean;
}
export declare class Dropdown<T> extends React.Component<DropdownProps<T>, DropdownState> {
    state: DropdownState;
    componentDidMount(): void;
    componentWillUnmount(): void;
    onClick: () => void;
    globalMouseDownListener: (e: MouseEvent) => void;
    globalKeyDownListener: (e: KeyboardEvent) => void;
    renderMenu(): JSX.Element;
    render(): JSX.Element;
}
