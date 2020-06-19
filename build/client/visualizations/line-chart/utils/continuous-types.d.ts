import { NumberRange, TimeRange } from "plywood";
export declare type ContinuousValue = number | Date;
export declare type ContinuousRange = NumberRange | TimeRange;
export declare type ContinuousDomain = [ContinuousValue, ContinuousValue];
export interface ContinuousScale {
    (x: ContinuousValue): number;
    invert(x: number): ContinuousValue;
    domain(): ContinuousDomain;
    domain(domain: ContinuousDomain): ContinuousScale;
    range(): number[];
    range(range: number[]): ContinuousScale;
}
