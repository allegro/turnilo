import { Instance } from "immutable-class";
import { Measure, MeasureJS } from "./measure";
export declare type MeasureOrGroupJS = MeasureJS | MeasureGroupJS;
export declare type MeasureOrGroup = Measure | MeasureGroup;
export interface MeasureGroupJS {
    name: string;
    title?: string;
    description?: string;
    measures: MeasureOrGroupJS[];
}
export interface MeasureGroupValue {
    name: string;
    title?: string;
    description?: string;
    measures: MeasureOrGroup[];
}
export interface MeasureOrGroupVisitor<R> {
    visitMeasure(measure: Measure): R;
    visitMeasureGroup(measureGroup: MeasureGroup): R;
}
export declare function measureOrGroupFromJS(measureOrGroup: MeasureOrGroupJS): MeasureOrGroup;
export declare function isMeasureGroupJS(measureOrGroupJS: MeasureOrGroupJS): measureOrGroupJS is MeasureGroupJS;
export declare class MeasureGroup implements Instance<MeasureGroupValue, MeasureGroupJS> {
    static fromJS(parameters: MeasureGroupJS): MeasureGroup;
    static isMeasureGroup(candidate: any): candidate is MeasureGroup;
    readonly name: string;
    readonly title: string;
    readonly description: string;
    readonly type = "group";
    readonly measures: MeasureOrGroup[];
    constructor(parameters: MeasureGroupValue);
    accept<R>(visitor: MeasureOrGroupVisitor<R>): R;
    equals(other: any): boolean;
    toJS(): MeasureGroupJS;
    toJSON(): MeasureGroupJS;
    valueOf(): MeasureGroupValue;
}
