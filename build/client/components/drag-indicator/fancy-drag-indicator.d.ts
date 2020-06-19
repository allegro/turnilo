import * as React from "react";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import "./fancy-drag-indicator.scss";
export interface FancyDragIndicatorProps {
    dragPosition: DragPosition;
}
export interface FancyDragIndicatorState {
}
export declare class FancyDragIndicator extends React.Component<FancyDragIndicatorProps, FancyDragIndicatorState> {
    render(): JSX.Element;
}
