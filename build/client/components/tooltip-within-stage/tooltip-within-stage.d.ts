import * as React from "react";
import { Stage } from "../../../common/models/stage/stage";
import { Rect } from "./calculate-position";
import "./tooltip-within-stage.scss";
export interface TooltipWithinStageProps {
    stage: Stage;
    top: number;
    left: number;
    margin?: number;
}
interface TooltipWithinStageState {
    rect?: Rect;
}
export declare class TooltipWithinStage extends React.Component<TooltipWithinStageProps, TooltipWithinStageState> {
    private self;
    state: TooltipWithinStageState;
    componentDidMount(): void;
    render(): JSX.Element;
}
export {};
