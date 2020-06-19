import { scale } from "d3";
import * as React from "react";
import { Stage } from "../../../../../common/models/stage/stage";
import { Unary } from "../../../../../common/utils/functional/functional";
import { ContinuousScale } from "../../utils/continuous-types";
import { ContinuousTicks } from "../../utils/pick-x-axis-ticks";
import "./background.scss";
interface BackgroundProps {
    gridStage: Stage;
    axisStage: Stage;
    xScale: ContinuousScale;
    xTicks: ContinuousTicks;
    yScale: Linear;
    formatter: Unary<number, string>;
}
declare type Linear = scale.Linear<number, number>;
export declare const Background: React.SFC<BackgroundProps>;
export {};
