import * as React from "react";
import { Fn } from "../../../common/utils/general/general";
import { TileHeaderIcon } from "../tile-header/tile-header";
import "./searchable-tile.scss";
export interface TileAction {
    selected: boolean;
    onSelect: Fn;
    keyString?: string;
    displayValue?: string;
}
export interface SearchableTileProps {
    toggleChangeFn: Fn;
    onSearchChange: (text: string) => void;
    searchText: string;
    showSearch: boolean;
    icons: TileHeaderIcon[];
    className?: string;
    style: Record<string, any>;
    title: string;
    onDragStart?: (event: React.DragEvent<HTMLElement>) => void;
    actions?: TileAction[];
}
export interface SearchableTileState {
    actionsMenuOpenOn?: Element;
    actionsMenuAlignOn?: Element;
}
export declare class SearchableTile extends React.Component<SearchableTileProps, SearchableTileState> {
    mounted: boolean;
    state: SearchableTileState;
    componentDidMount(): void;
    componentWillUnmount(): void;
    globalMouseDownListener: (e: MouseEvent) => void;
    globalKeyDownListener: (e: KeyboardEvent) => void;
    onActionsMenuClose: () => void;
    onActionsMenuClick: (e: React.MouseEvent<HTMLElement>) => void;
    onSelectGranularity(action: TileAction): void;
    renderGranularityElements(): JSX.Element[];
    renderActionsMenu(): JSX.Element;
    render(): JSX.Element;
}
