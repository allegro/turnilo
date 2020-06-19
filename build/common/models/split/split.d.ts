import { Duration } from "chronoshift";
import { Record } from "immutable";
import { Expression } from "plywood";
import { Dimension } from "../dimension/dimension";
import { Sort } from "../sort/sort";
import { TimeShiftEnv } from "../time-shift/time-shift-env";
export declare enum SplitType {
    number = "number",
    string = "string",
    time = "time"
}
export declare type Bucket = number | Duration;
export interface SplitValue {
    type: SplitType;
    reference: string;
    bucket: Bucket;
    sort: Sort;
    limit: number;
}
export declare function bucketToAction(bucket: Bucket): Expression;
export declare function toExpression({ bucket, type }: Split, { expression }: Dimension, env: TimeShiftEnv): Expression;
export declare function kindToType(kind: string): SplitType;
declare const Split_base: Record.Factory<SplitValue>;
export declare class Split extends Split_base {
    static fromDimension({ name, kind }: Dimension): Split;
    toString(): string;
    toKey(): string;
    changeBucket(bucket: Bucket): Split;
    changeSort(sort: Sort): Split;
    changeLimit(limit: number): Split;
    getTitle(dimension: Dimension): string;
    getBucketTitle(): string;
    equals(other: any): boolean;
}
export {};
