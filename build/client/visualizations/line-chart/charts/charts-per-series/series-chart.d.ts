import { Dataset } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { Stage } from "../../../../../common/models/stage/stage";
import { InteractionsProps } from "../../interactions/interaction-controller";
import { ContinuousScale } from "../../utils/continuous-types";
import { ContinuousTicks } from "../../utils/pick-x-axis-ticks";
interface SeriesChartProps {
    chartId: string;
    interactions: InteractionsProps;
    essence: Essence;
    dataset: Dataset;
    series: ConcreteSeries;
    xScale: ContinuousScale;
    xTicks: ContinuousTicks;
    chartStage: Stage;
    visualisationStage: Stage;
}
export declare const SeriesChart: React.SFC<SeriesChartProps>;
export {};
