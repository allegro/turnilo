import * as React from "react";
import "./resize-handle.scss";
export declare enum Direction {
    LEFT = "left",
    RIGHT = "right",
    TOP = "top",
    BOTTOM = "bottom"
}
export interface ResizeHandleProps {
    direction: Direction;
    min: number;
    max: number;
    value: number;
    onResize?: (newX: number) => void;
    onResizeEnd?: () => void;
}
export interface ResizeHandleState {
    dragging?: boolean;
    anchor?: number;
}
export declare const DragHandle: () => JSX.Element;
export declare class ResizeHandle extends React.Component<ResizeHandleProps, ResizeHandleState> {
    state: ResizeHandleState;
    onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
    onGlobalMouseUp: () => void;
    onGlobalMouseMove: (event: MouseEvent) => void;
    private getValue;
    private getCoordinate;
    private constrainValue;
    render(): JSX.Element;
}
