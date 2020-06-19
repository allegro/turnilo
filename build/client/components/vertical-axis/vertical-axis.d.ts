import * as React from "react";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import "./vertical-axis.scss";
export interface VerticalAxisProps {
    stage: Stage;
    ticks: number[];
    tickSize: number;
    scale: any;
    formatter: Unary<number, string>;
    topLineExtend?: number;
    hideZero?: boolean;
}
export declare const VerticalAxis: React.SFC<VerticalAxisProps>;
