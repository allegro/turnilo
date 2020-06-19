import { Datum } from "plywood";
import { Unary } from "../../../../common/utils/functional/functional";
import { ContinuousRange } from "../utils/continuous-types";
declare type DataPoint = [number, number];
export declare function prepareDataPoints(dataset: Datum[], getX: Unary<Datum, ContinuousRange>, getY: Unary<Datum, number>): DataPoint[];
export {};
