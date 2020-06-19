import * as d3 from "d3";
import * as React from "react";
import { Stage } from "../../../../../common/models/stage/stage";
import { Hover } from "../../interactions/interaction";
import { ContinuousScale } from "../../utils/continuous-types";
interface HoverGuideProps {
    hover: Hover;
    stage: Stage;
    yScale: d3.scale.Linear<number, number>;
    xScale: ContinuousScale;
}
export declare const HoverGuide: React.SFC<HoverGuideProps>;
export {};
