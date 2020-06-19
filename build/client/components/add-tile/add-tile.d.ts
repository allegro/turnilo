import * as React from "react";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import "./add-tile.scss";
export interface Tile<T> {
    key: string;
    label: string;
    value: T;
}
interface AddTileProps<T> {
    tiles: Array<Tile<T>>;
    onSelect: Unary<T, void>;
    containerStage: Stage;
}
interface AddTileState {
    openMenu: boolean;
    query: string;
}
export declare class AddTile<T> extends React.Component<AddTileProps<T>, AddTileState> {
    state: AddTileState;
    private menuOpenOn;
    mountAdd: (addButton: HTMLElement) => void;
    closeMenu: () => void;
    openMenu: () => void;
    setQuery: (query: string) => void;
    resetQuery: () => void;
    selectTile: (value: T) => void;
    renderRows(rows: Array<Tile<T>>): JSX.Element[];
    renderTable(): JSX.Element | JSX.Element[];
    renderMenu(): JSX.Element;
    render(): JSX.Element;
}
export {};
