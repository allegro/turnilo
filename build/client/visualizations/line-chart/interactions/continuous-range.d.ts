import { Timezone } from "chronoshift";
import { ContinuousRange, ContinuousValue } from "../utils/continuous-types";
export declare function constructRange(a: ContinuousValue, b: ContinuousValue, timezone: Timezone): ContinuousRange;
export declare function shiftByOne(value: ContinuousValue, timezone: Timezone): ContinuousValue;
