import { Instance } from "immutable-class";
import { Dimension, DimensionJS } from "./dimension";
export declare type DimensionOrGroupJS = DimensionJS | DimensionGroupJS;
export declare type DimensionOrGroup = Dimension | DimensionGroup;
export interface DimensionGroupJS {
    name: string;
    title?: string;
    description?: string;
    dimensions: DimensionOrGroupJS[];
}
export interface DimensionGroupValue {
    name: string;
    title?: string;
    description?: string;
    dimensions: DimensionOrGroup[];
}
export interface DimensionOrGroupVisitor<R> {
    visitDimension(dimension: Dimension): R;
    visitDimensionGroup(dimensionGroup: DimensionGroup): R;
}
export declare function dimensionOrGroupFromJS(dimensionOrGroup: DimensionOrGroupJS): DimensionOrGroup;
export declare class DimensionGroup implements Instance<DimensionGroupValue, DimensionGroupJS> {
    static fromJS(dimensionGroup: DimensionGroupJS): DimensionGroup;
    static isDimensionGroup(candidate: any): candidate is DimensionGroup;
    readonly name: string;
    readonly title: string;
    readonly description: string;
    readonly type = "group";
    readonly dimensions: DimensionOrGroup[];
    constructor(parameters: DimensionGroupValue);
    accept<R>(visitor: DimensionOrGroupVisitor<R>): R;
    equals(other: any): boolean;
    toJS(): DimensionGroupJS;
    toJSON(): DimensionGroupJS;
    valueOf(): DimensionGroupValue;
}
