import * as React from "react";
import { Unary } from "../../../common/utils/functional/functional";
import "./delta.scss";
export declare type DeltaSign = -1 | 0 | 1;
export interface DeltaAttributes {
    delta: number;
    deltaRatio: number;
    deltaSign: DeltaSign;
}
export declare function formatDelta(currentValue: number, previousValue: number): DeltaAttributes;
export interface DeltaProps {
    currentValue: number;
    previousValue: number;
    formatter: Unary<number, string>;
    lowerIsBetter?: boolean;
}
export declare const Delta: React.SFC<DeltaProps>;
