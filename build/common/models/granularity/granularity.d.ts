import { Duration } from "chronoshift";
import { Bucket } from "../split/split";
export declare type GranularityJS = string | number;
export declare type ContinuousDimensionKind = "time" | "number";
declare type BucketableRange = {
    start: number;
    end: number;
} | {
    start: Date;
    end: Date;
};
export declare function validateGranularity(kind: string, granularity: string): string;
export declare function isGranularityValid(kind: string, granularity: string): boolean;
export interface Checker {
    checkPoint: number;
    returnValue: Bucket;
}
export declare class TimeHelper {
    static dimensionKind: ContinuousDimensionKind;
    static minGranularity: Duration;
    static defaultGranularity: Duration;
    static supportedGranularities: (_: Bucket) => Bucket[];
    static checkers: Checker[];
    static coarseCheckers: Checker[];
    static defaultGranularities: Bucket[];
    static coarseGranularities: Bucket[];
}
export declare class NumberHelper {
    static dimensionKind: ContinuousDimensionKind;
    static minGranularity: number;
    static defaultGranularity: number;
    static checkers: Checker[];
    static defaultGranularities: any[];
    static coarseGranularities: Bucket[];
    static coarseCheckers: Checker[];
    static supportedGranularities: (bucketedBy: Bucket) => Bucket[];
}
export declare function granularityFromJS(input: GranularityJS): Bucket;
export declare function granularityToString(input: Bucket): string;
export declare function formatGranularity(bucket: Bucket): string;
export declare function granularityEquals(g1: Bucket, g2: Bucket): boolean;
export declare function granularityToJS(input: Bucket): GranularityJS;
export declare function getGranularities(kind: ContinuousDimensionKind, bucketedBy?: Bucket, coarse?: boolean): Bucket[];
export declare function getDefaultGranularityForKind(kind: ContinuousDimensionKind, bucketedBy?: Bucket, customGranularities?: Bucket[]): Bucket;
export declare function getBestGranularityForRange(inputRange: BucketableRange, bigChecker: boolean, bucketedBy?: Bucket, customGranularities?: Bucket[]): Bucket;
export declare function getBestBucketUnitForRange(inputRange: BucketableRange, bigChecker: boolean, bucketedBy?: Bucket, customGranularities?: Bucket[]): Bucket;
export {};
