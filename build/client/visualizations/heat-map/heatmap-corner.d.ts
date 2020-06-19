import * as React from "react";
import { Essence } from "../../../common/models/essence/essence";
import "./heatmap-corner.scss";
import { ColorScale } from "./utils/scales";
interface HeatmapCornerProps {
    essence: Essence;
    width: number;
    height: number;
    colorScale: ColorScale;
}
export declare const HeatmapCorner: React.SFC<HeatmapCornerProps>;
export {};
