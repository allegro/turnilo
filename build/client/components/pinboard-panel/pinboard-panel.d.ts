import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import "./pinboard-panel.scss";
export interface PinboardPanelProps {
    clicker: Clicker;
    essence: Essence;
    timekeeper: Timekeeper;
    style?: React.CSSProperties;
}
export interface PinboardPanelState {
    dragOver?: boolean;
}
export declare const LegendSpot: typeof React.Component;
export declare class PinboardPanel extends React.Component<PinboardPanelProps, PinboardPanelState> {
    constructor(props: PinboardPanelProps);
    canDrop(): boolean;
    isStringOrBoolean({ kind }: Dimension): boolean;
    alreadyPinned({ name }: Dimension): boolean;
    dragEnter: (e: React.DragEvent<HTMLElement>) => void;
    dragOver: (e: React.DragEvent<HTMLElement>) => void;
    dragLeave: () => void;
    drop: (e: React.DragEvent<HTMLElement>) => void;
    render(): JSX.Element;
}
