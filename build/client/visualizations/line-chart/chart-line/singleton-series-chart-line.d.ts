import * as React from "react";
import { Omit } from "../../../../common/utils/functional/functional";
import { SeriesChartLineProps } from "./series-chart-line";
declare type SingletonSeriesChartLineProps = Omit<SeriesChartLineProps, "color" | "showArea">;
export declare const SingletonSeriesChartLine: React.SFC<SingletonSeriesChartLineProps>;
export {};
