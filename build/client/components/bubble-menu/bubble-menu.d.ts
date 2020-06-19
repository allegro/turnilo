import * as React from "react";
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import "./bubble-menu.scss";
export declare const OFFSET_H = 10;
export declare const OFFSET_V = 0;
export declare const SCREEN_OFFSET = 5;
export declare type BubbleLayout = "normal" | "mini";
export declare type Align = "start" | "center" | "end";
export declare type Direction = "down" | "right" | "up";
export interface BubbleMenuProps {
    className: string;
    id?: string;
    direction: Direction;
    stage: Stage;
    fixedSize?: boolean;
    containerStage?: Stage;
    openOn: Element;
    alignOn?: Element;
    onClose: Fn;
    inside?: Element;
    layout?: BubbleLayout;
    align?: Align;
}
export interface BubbleMenuState {
    id?: string;
    x?: number;
    y?: number;
}
export declare class BubbleMenu extends React.Component<BubbleMenuProps, BubbleMenuState> {
    static defaultProps: Partial<BubbleMenuProps>;
    state: BubbleMenuState;
    componentDidMount(): void;
    componentWillUnmount(): void;
    globalMouseDownListener: (e: MouseEvent) => void;
    globalKeyDownListener: (e: KeyboardEvent) => void;
    private calcBubbleCoordinates;
    private calcMenuPosition;
    private calcShpitzPosition;
    getInsideId(): string | null;
    render(): any;
}
