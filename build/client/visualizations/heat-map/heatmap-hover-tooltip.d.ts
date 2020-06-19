import { Datum } from "plywood";
import * as React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { HoverPosition } from "./utils/get-hover-position";
interface HeatmapHoverTooltip {
    dataset: Datum[];
    position: HoverPosition;
    essence: Essence;
    scroll: {
        left: number;
        top: number;
    };
}
export declare const HeatmapHoverTooltip: React.SFC<HeatmapHoverTooltip>;
export {};
