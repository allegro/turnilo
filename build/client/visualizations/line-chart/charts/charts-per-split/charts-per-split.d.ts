import { Dataset } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { Stage } from "../../../../../common/models/stage/stage";
import { InteractionsProps } from "../../interactions/interaction-controller";
import { ContinuousScale } from "../../utils/continuous-types";
import { ContinuousTicks } from "../../utils/pick-x-axis-ticks";
interface ChartsPerSplit {
    interactions: InteractionsProps;
    essence: Essence;
    dataset: Dataset;
    xScale: ContinuousScale;
    xTicks: ContinuousTicks;
    stage: Stage;
}
export declare const ChartsPerSplit: React.SFC<ChartsPerSplit>;
export {};
