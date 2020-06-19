import * as d3 from "d3";
import { Datum } from "plywood";
import * as React from "react";
import { Stage } from "../../../../common/models/stage/stage";
import { Unary } from "../../../../common/utils/functional/functional";
import { ContinuousRange, ContinuousScale } from "../utils/continuous-types";
import "./chart-line.scss";
export declare type Scale = d3.scale.Linear<number, number>;
export interface ChartLineProps {
    xScale: ContinuousScale;
    yScale: Scale;
    getX: Unary<Datum, ContinuousRange>;
    getY: Unary<Datum, number>;
    color?: string;
    showArea: boolean;
    dashed: boolean;
    dataset: Datum[];
    stage: Stage;
}
export declare const ChartLine: React.SFC<ChartLineProps>;
