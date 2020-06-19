import { FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Highlight as VizHighlight } from "../../base-visualization/highlight";
import { ContinuousRange, ContinuousValue } from "../utils/continuous-types";
declare enum InteractionKind {
    HOVER = 0,
    DRAGGING = 1,
    HIGHLIGHT = 2
}
interface InteractionBase {
    kind: InteractionKind;
    key: string;
}
export interface Hover extends InteractionBase {
    kind: InteractionKind.HOVER;
    range: ContinuousRange;
}
export declare const createHover: (key: string, range: ContinuousRange) => Hover;
export declare const isHover: (interaction?: Interaction) => interaction is Hover;
export interface Dragging extends InteractionBase {
    kind: InteractionKind.DRAGGING;
    start: ContinuousValue;
    end: ContinuousValue;
}
export declare const createDragging: (key: string, start: number | Date, end: number | Date) => Dragging;
export declare const isDragging: (interaction?: Interaction) => interaction is Dragging;
export interface Highlight extends InteractionBase {
    kind: InteractionKind.HIGHLIGHT;
    clause: FilterClause;
}
export declare const createHighlight: (highlight: VizHighlight) => Highlight;
export declare const isHighlight: (interaction?: Interaction) => interaction is Highlight;
export declare type MouseInteraction = Hover | Dragging;
export declare type Interaction = Hover | Dragging | Highlight;
export {};
