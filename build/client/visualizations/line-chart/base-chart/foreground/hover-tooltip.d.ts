import { Timezone } from "chronoshift";
import * as React from "react";
import { ReactNode } from "react";
import { Stage } from "../../../../../common/models/stage/stage";
import { Hover } from "../../interactions/interaction";
import { ContinuousScale } from "../../utils/continuous-types";
interface HoverTooltipProps {
    interaction: Hover;
    xScale: ContinuousScale;
    timezone: Timezone;
    content: ReactNode;
    stage: Stage;
}
export declare const HoverTooltip: React.SFC<HoverTooltipProps>;
export {};
