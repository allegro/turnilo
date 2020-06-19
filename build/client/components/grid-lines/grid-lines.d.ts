import * as React from "react";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import "./grid-lines.scss";
export interface GridLinesProps {
    orientation: "horizontal" | "vertical";
    stage: Stage;
    ticks: Array<unknown>;
    scale: Unary<unknown, number>;
}
export declare const GridLines: React.SFC<GridLinesProps>;
