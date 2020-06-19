import { Dataset, Datum } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { Stage } from "../../../../../common/models/stage/stage";
import { Unary } from "../../../../../common/utils/functional/functional";
import { InteractionsProps } from "../../interactions/interaction-controller";
import { ContinuousScale } from "../../utils/continuous-types";
import { ContinuousTicks } from "../../utils/pick-x-axis-ticks";
interface SplitChartProps {
    interactions: InteractionsProps;
    chartId: string;
    essence: Essence;
    dataset: Dataset;
    selectDatum: Unary<Dataset, Datum>;
    xScale: ContinuousScale;
    xTicks: ContinuousTicks;
    chartStage: Stage;
    visualisationStage: Stage;
}
export declare const SplitChart: React.SFC<SplitChartProps>;
export {};
