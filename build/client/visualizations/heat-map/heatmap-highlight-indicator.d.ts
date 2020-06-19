import * as React from "react";
import "./heatmap-highlight-indicator.scss";
import { HighlightPosition } from "./utils/get-highlight-position";
interface HeatmapHighlightIndicatorProps {
    tileSize: number;
    tileGap: number;
    position: HighlightPosition;
    width: number;
    height: number;
}
export declare const HeatmapHighlightIndicator: React.SFC<HeatmapHighlightIndicatorProps>;
export {};
