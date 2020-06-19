import { Instance } from "immutable-class";
import { Expression } from "plywood";
import { GranularityJS } from "../granularity/granularity";
import { Bucket } from "../split/split";
import { DimensionOrGroupVisitor } from "./dimension-group";
export declare type DimensionKind = "string" | "boolean" | "time" | "number";
export declare enum BucketingStrategy {
    defaultBucket = "defaultBucket",
    defaultNoBucket = "defaultNoBucket"
}
export interface DimensionValue {
    name: string;
    title?: string;
    description?: string;
    formula?: string;
    kind?: DimensionKind;
    multiValue?: boolean;
    url?: string;
    granularities?: Bucket[];
    bucketedBy?: Bucket;
    bucketingStrategy?: BucketingStrategy;
    sortStrategy?: string;
}
export interface DimensionJS {
    name: string;
    title?: string;
    description?: string;
    formula?: string;
    kind?: DimensionKind;
    multiValue?: boolean;
    url?: string;
    granularities?: GranularityJS[];
    bucketedBy?: GranularityJS;
    bucketingStrategy?: BucketingStrategy;
    sortStrategy?: string;
}
export declare class Dimension implements Instance<DimensionValue, DimensionJS> {
    static isDimension(candidate: any): candidate is Dimension;
    static fromJS(parameters: DimensionJS): Dimension;
    name: string;
    title: string;
    description?: string;
    formula: string;
    expression: Expression;
    kind: DimensionKind;
    multiValue: boolean;
    className: string;
    url: string;
    granularities: Bucket[];
    bucketedBy: Bucket;
    bucketingStrategy: BucketingStrategy;
    sortStrategy: string;
    type: string;
    constructor(parameters: DimensionValue);
    accept<R>(visitor: DimensionOrGroupVisitor<R>): R;
    valueOf(): DimensionValue;
    toJS(): DimensionJS;
    toJSON(): DimensionJS;
    toString(): string;
    equals(other: any): boolean;
    private granularitiesEqual;
    canBucketByDefault(): boolean;
    isContinuous(): boolean;
    change(propertyName: string, newValue: any): Dimension;
    changeKind(newKind: DimensionKind): Dimension;
    changeName(newName: string): Dimension;
    changeTitle(newTitle: string): Dimension;
    changeFormula(newFormula: string): Dimension;
}
