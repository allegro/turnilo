import { Timezone } from "chronoshift";
import * as React from "react";
import { Nullary } from "../../../../../common/utils/functional/functional";
import { Highlight } from "../../interactions/interaction";
import { ContinuousScale } from "../../utils/continuous-types";
interface HighlightModalProps {
    interaction: Highlight;
    dropHighlight: Nullary<void>;
    acceptHighlight: Nullary<void>;
    timezone: Timezone;
    xScale: ContinuousScale;
    rect: ClientRect | DOMRect;
}
export declare const HighlightModal: React.SFC<HighlightModalProps>;
export {};
