import { Timezone } from "chronoshift";
import * as React from "react";
import { ContinuousScale } from "../utils/continuous-types";
import "./x-axis.scss";
export interface XAxisProps {
    width: number;
    ticks: Array<Date | number>;
    scale: ContinuousScale;
    timezone: Timezone;
}
export declare const XAxis: React.SFC<XAxisProps>;
