import { Timezone } from "chronoshift";
import * as React from "react";
import { Stage } from "../../../../../common/models/stage/stage";
import { Interaction } from "../../interactions/interaction";
import { ContinuousScale } from "../../utils/continuous-types";
interface SelectionOverlayProps {
    interaction: Interaction;
    stage: Stage;
    xScale: ContinuousScale;
    timezone: Timezone;
}
export declare const SelectionOverlay: React.SFC<SelectionOverlayProps>;
export {};
