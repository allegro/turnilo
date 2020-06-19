import { Datum } from "plywood";
import * as React from "react";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import "./heatmap-rectangles.scss";
import { ColorScale, LinearScale } from "./utils/scales";
export interface HeatMapRectanglesProps {
    dataset: Datum[];
    series: ConcreteSeries;
    colorScale: ColorScale;
    xScale: LinearScale;
    yScale: LinearScale;
    tileSize: number;
    gap: number;
    leftLabelName: string;
    topLabelName: string;
}
export declare class HeatMapRectangles extends React.Component<HeatMapRectanglesProps> {
    shouldComponentUpdate(nextProps: Readonly<HeatMapRectanglesProps>): boolean;
    render(): JSX.Element;
}
