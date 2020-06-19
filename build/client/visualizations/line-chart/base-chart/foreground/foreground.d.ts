import { Timezone } from "chronoshift";
import * as React from "react";
import { ReactNode } from "react";
import { Stage } from "../../../../../common/models/stage/stage";
import { Nullary } from "../../../../../common/utils/functional/functional";
import { Interaction } from "../../interactions/interaction";
import { ContinuousScale } from "../../utils/continuous-types";
interface ForegroundProps {
    interaction: Interaction;
    stage: Stage;
    visualisationStage: Stage;
    container: React.RefObject<HTMLDivElement>;
    dropHighlight: Nullary<void>;
    acceptHighlight: Nullary<void>;
    hoverContent?: ReactNode;
    xScale: ContinuousScale;
    timezone: Timezone;
}
export declare const Foreground: React.SFC<ForegroundProps>;
export {};
