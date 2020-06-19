import * as React from "react";
import "./range-handle.scss";
export interface RangeHandleProps {
    positionLeft: number;
    onChange: (x: number) => void;
    offset: number;
    isAny: boolean;
    isBeyondMin?: boolean;
    isBeyondMax?: boolean;
    rightBound?: number;
    leftBound?: number;
}
export interface RangeHandleState {
    anchor: number;
}
export declare class RangeHandle extends React.Component<RangeHandleProps, RangeHandleState> {
    mounted: boolean;
    state: RangeHandleState;
    onGlobalMouseMove: (event: MouseEvent) => void;
    onMouseDown: (event: React.MouseEvent<HTMLElement>) => void;
    onGlobalMouseUp: () => void;
    render(): JSX.Element;
}
