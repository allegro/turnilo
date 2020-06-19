import { Timezone } from "chronoshift";
import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Essence } from "../../../common/models/essence/essence";
import { FilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import "./filter-tile.scss";
export interface ItemBlank {
    dimension: Dimension;
    source: string;
    clause?: FilterClause;
}
export interface FilterTileProps {
    clicker: Clicker;
    essence: Essence;
    timekeeper: Timekeeper;
    menuStage: Stage;
}
export interface FilterTileState {
    menuOpenOn?: Element;
    menuDimension?: Dimension;
    menuInside?: Element;
    overflowMenuOpenOn?: Element;
    dragPosition?: DragPosition;
    possibleDimension?: Dimension;
    possiblePosition?: DragPosition;
    maxItems?: number;
    maxWidth?: number;
}
export declare class FilterTile extends React.Component<FilterTileProps, FilterTileState> {
    private readonly overflowMenuId;
    private dummyDeferred;
    private overflowMenuDeferred;
    private items;
    private overflow;
    constructor(props: FilterTileProps);
    componentWillReceiveProps(nextProps: FilterTileProps): void;
    componentDidUpdate(): void;
    overflowButtonTarget(): Element;
    getOverflowMenu(): Element;
    clickDimension(dimension: Dimension, e: React.MouseEvent<HTMLElement>): void;
    openMenuOnDimension(dimension: Dimension): void;
    toggleMenu(dimension: Dimension, target: Element): void;
    openMenu(dimension: Dimension, target: Element): void;
    closeMenu: () => void;
    openOverflowMenu(target: Element): Promise<Element>;
    closeOverflowMenu: () => void;
    removeFilter(itemBlank: ItemBlank, e: MouseEvent): void;
    dragStart(dimension: Dimension, clause: FilterClause, e: DragEvent): void;
    calculateDragPosition(e: React.DragEvent<HTMLElement>): DragPosition;
    canDrop(): boolean;
    dragEnter: (e: React.DragEvent<HTMLElement>) => void;
    dragOver: (e: React.DragEvent<HTMLElement>) => void;
    dragLeave: () => void;
    draggingDimension(): Dimension;
    drop: (e: React.DragEvent<HTMLElement>) => void;
    private dropDimension;
    private dropFilter;
    appendFilter: (dimension: Dimension) => void;
    addDummy(dimension: Dimension, possiblePosition: DragPosition): void;
    filterMenuRequest(dimension: Dimension): void;
    overflowButtonClick: () => void;
    renderMenu(): JSX.Element;
    renderOverflowMenu(overflowItemBlanks: ItemBlank[]): JSX.Element;
    renderOverflow(overflowItemBlanks: ItemBlank[], itemX: number): JSX.Element;
    renderRemoveButton(itemBlank: ItemBlank): JSX.Element;
    renderTimeShiftLabel(dimension: Dimension): string;
    renderItemLabel(dimension: Dimension, clause: FilterClause, timezone: Timezone): JSX.Element;
    renderItemBlank(itemBlank: ItemBlank, style: any): JSX.Element;
    getItemBlanks(): ItemBlank[];
    renderAddButton(): JSX.Element;
    render(): JSX.Element;
}
