import { List } from "immutable";
import { Dataset } from "plywood";
import * as React from "react";
import { ReactNode } from "react";
import { Essence } from "../../../../common/models/essence/essence";
import { FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Binary, Nullary, Unary } from "../../../../common/utils/functional/functional";
import { Highlight } from "../../base-visualization/highlight";
import { ContinuousScale } from "../utils/continuous-types";
import { Interaction, MouseInteraction } from "./interaction";
interface InteractionControllerProps {
    xScale: ContinuousScale;
    essence: Essence;
    dataset: Dataset;
    children: Unary<InteractionsProps, ReactNode>;
    highlight?: Highlight;
    saveHighlight: Binary<List<FilterClause>, string, void>;
    dropHighlight: Nullary<void>;
    acceptHighlight: Nullary<void>;
    chartsContainerRef: React.RefObject<HTMLDivElement>;
}
interface InteractionsState {
    interaction: MouseInteraction | null;
    scrollTop: number;
}
export interface InteractionsProps {
    interaction: Interaction | null;
    dropHighlight: Nullary<void>;
    acceptHighlight: Nullary<void>;
    dragStart: Binary<string, number, void>;
    handleHover: Binary<string, number, void>;
    mouseLeave: Nullary<void>;
}
export declare class InteractionController extends React.Component<InteractionControllerProps, InteractionsState> {
    state: InteractionsState;
    handleHover: (chartId: string, offset: number) => void;
    onMouseLeave: () => void;
    handleDragStart: (chartId: string, offset: number) => void;
    private calculateOffset;
    dragging: (e: MouseEvent) => void;
    stopDragging: (e: MouseEvent) => void;
    private findValueUnderOffset;
    private findRangeUnderOffset;
    scrollCharts: (scrollEvent: MouseEvent) => void;
    interaction(): Interaction | null;
    render(): JSX.Element;
}
export {};
