import * as React from "react";
import { Component, CSSProperties } from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { Stage } from "../../../common/models/stage/stage";
import "./dimension-list-tile.scss";
export interface DimensionListTileProps {
    clicker: Clicker;
    essence: Essence;
    menuStage: Stage;
    triggerFilterMenu: (dimension: Dimension) => void;
    style?: CSSProperties;
}
export interface DimensionListTileState {
    menuOpenOn?: Element;
    menuDimension?: Dimension;
    showSearch?: boolean;
    searchText?: string;
}
export declare class DimensionListTile extends Component<DimensionListTileProps, DimensionListTileState> {
    state: DimensionListTileState;
    clickDimension: (dimensionName: string, e: React.MouseEvent<HTMLElement>) => void;
    closeMenu: () => void;
    dragStart: (dimensionName: string, e: React.DragEvent<HTMLElement>) => void;
    toggleSearch: () => void;
    onSearchChange: (text: string) => void;
    renderMenu(): JSX.Element;
    private renderMessageIfNoDimensionsFound;
    render(): JSX.Element;
}
