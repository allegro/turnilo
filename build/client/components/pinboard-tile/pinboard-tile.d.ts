import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { SortOn } from "../../../common/models/sort-on/sort-on";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { DatasetLoad } from "../../../common/models/visualization-props/visualization-props";
import "./pinboard-tile.scss";
export declare class PinboardTileProps {
    essence: Essence;
    clicker: Clicker;
    dimension: Dimension;
    timekeeper: Timekeeper;
    sortOn: SortOn;
}
export interface PinboardTileState {
    searchText: string;
    showSearch: boolean;
    datasetLoad: DatasetLoad;
}
export declare class PinboardTile extends React.Component<PinboardTileProps, PinboardTileState> {
    state: PinboardTileState;
    private loadData;
    private fetchData;
    private lastQueryParams;
    private callExecutor;
    private debouncedCallExecutor;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(previousProps: PinboardTileProps, previousState: PinboardTileState): void;
    onDragStart: (e: React.DragEvent<HTMLElement>) => void;
    toggleSearch: () => void;
    setSearchText: (text: string) => void;
    private getFormatter;
    private isEditable;
    private isInEdit;
    private pinnedClause;
    private addClause;
    private removeClause;
    private updateClause;
    unpin: () => void;
    private toggleFilterValue;
    private createFilterClause;
    private getRowMode;
    render(): JSX.Element;
}
