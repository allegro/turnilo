import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Essence } from "../../../common/models/essence/essence";
import { Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import "./split-tile.scss";
interface SplitTilesRowProps {
    clicker: Clicker;
    essence: Essence;
    menuStage: Stage;
}
interface SplitTilesRowState {
    dragPosition?: DragPosition;
    openedSplit?: Split;
    overflowOpen?: boolean;
}
export declare class SplitTilesRow extends React.Component<SplitTilesRowProps, SplitTilesRowState> {
    private items;
    state: SplitTilesRowState;
    private maxItems;
    openMenu: (split: Split) => void;
    closeMenu: () => void;
    openOverflowMenu: () => void;
    closeOverflowMenu: () => void;
    updateSplit: (oldSplit: Split, split: Split) => void;
    removeSplit: (split: Split) => void;
    canDrop(): boolean;
    dragStart: (label: string, split: Split, e: React.DragEvent<HTMLElement>) => void;
    calculateDragPosition(e: React.DragEvent<HTMLElement>): DragPosition;
    dragEnter: (e: React.DragEvent<HTMLElement>) => void;
    dragOver: (e: React.DragEvent<HTMLElement>) => void;
    dragLeave: () => void;
    draggingSplit(): Split;
    drop: (e: React.DragEvent<HTMLElement>) => void;
    appendSplit: (dimension: Dimension) => void;
    insertSplit: (split: Split, index: number) => void;
    replaceSplit: (split: Split, index: number) => void;
    render(): JSX.Element;
}
export {};
