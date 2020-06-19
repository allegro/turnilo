import * as React from "react";
import { Omit } from "../../../../common/utils/functional/functional";
import { SeriesChartLineProps } from "./series-chart-line";
declare type ColoredSeriesChartLine = Omit<SeriesChartLineProps, "color" | "showArea"> & {
    color: string;
};
export declare const ColoredSeriesChartLine: React.SFC<ColoredSeriesChartLine>;
export {};
