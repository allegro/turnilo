import { Instance } from "immutable-class";
export interface DragPositionValue {
    insert?: number;
    replace?: number;
}
export interface DragPositionJS {
    insert?: number;
    replace?: number;
}
export declare class DragPosition implements Instance<DragPositionValue, DragPositionJS> {
    static isDragPosition(candidate: any): candidate is DragPosition;
    static calculateFromOffset(offset: number, numItems: number, itemWidth: number, itemGap: number): DragPosition;
    static fromJS(parameters: DragPositionJS): DragPosition;
    insert: number;
    replace: number;
    constructor(parameters: DragPositionValue);
    valueOf(): DragPositionValue;
    toJS(): DragPositionJS;
    toJSON(): DragPositionJS;
    toString(): string;
    equals(other: DragPosition): boolean;
    isInsert(): boolean;
    isReplace(): boolean;
}
