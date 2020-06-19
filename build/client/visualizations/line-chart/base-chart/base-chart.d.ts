import { Timezone } from "chronoshift";
import * as React from "react";
import { ReactNode } from "react";
import { Stage } from "../../../../common/models/stage/stage";
import { Unary } from "../../../../common/utils/functional/functional";
import { Scale } from "../chart-line/chart-line";
import { InteractionsProps } from "../interactions/interaction-controller";
import { ContinuousScale } from "../utils/continuous-types";
import { ContinuousTicks } from "../utils/pick-x-axis-ticks";
import "./base-chart.scss";
interface ChartLinesProps {
    yScale: Scale;
    lineStage: Stage;
}
declare class BaseChartProps {
    chartId: string;
    children: Unary<ChartLinesProps, ReactNode>;
    label: ReactNode;
    hoverContent?: ReactNode;
    xScale: ContinuousScale;
    timezone: Timezone;
    xTicks: ContinuousTicks;
    chartStage: Stage;
    visualisationStage: Stage;
    formatter: Unary<number, string>;
    yDomain: [number, number];
    interactions: InteractionsProps;
}
export declare class BaseChart extends React.Component<BaseChartProps> {
    private container;
    render(): JSX.Element;
}
export {};
