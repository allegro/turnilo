import * as React from "react";
import { Unary } from "../../../common/utils/functional/functional";
import "./measure-bubble-content.scss";
export interface MeasureBubbleContentProps {
    current: number;
    previous: number;
    formatter: Unary<number, string>;
    lowerIsBetter?: boolean;
}
export declare const MeasureBubbleContent: React.SFC<MeasureBubbleContentProps>;
