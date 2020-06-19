import * as React from "react";
import "./heatmap-hover-indicator.scss";
import { HoverPosition } from "./utils/get-hover-position";
interface HeatmapHoverIndicator {
    tileSize: number;
    tileGap: number;
    hoverPosition: HoverPosition;
}
export declare const HeatmapHoverIndicator: React.SFC<HeatmapHoverIndicator>;
export {};
