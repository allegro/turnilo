import * as React from "react";
import { Essence } from "../../../../common/models/essence/essence";
import { ConcreteSeries } from "../../../../common/models/series/concrete-series";
import { ChartLineProps } from "./chart-line";
interface OwnProps {
    essence: Essence;
    series: ConcreteSeries;
}
export declare type SeriesChartLineProps = Pick<ChartLineProps, "showArea" | "getX" | "xScale" | "yScale" | "dataset" | "color" | "stage"> & OwnProps;
export declare const SeriesChartLine: React.SFC<SeriesChartLineProps>;
export {};
