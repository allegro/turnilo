import * as React from "react";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import "./heatmap-legend.scss";
import { ColorScale } from "./utils/scales";
interface HeatmapLegendProps {
    scale: ColorScale;
    series: ConcreteSeries;
    height: number;
    width: number;
}
export declare const HeatmapLegend: React.SFC<HeatmapLegendProps>;
export {};
