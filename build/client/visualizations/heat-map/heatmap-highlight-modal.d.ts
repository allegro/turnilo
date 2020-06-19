import * as React from "react";
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import { ScrollerLayout } from "../../components/scroller/scroller";
import { HighlightPosition } from "./utils/get-highlight-position";
export interface HeatmapHighlightModalProps {
    title: string;
    stage: Stage;
    layout: ScrollerLayout;
    scroll: {
        left: number;
        top: number;
    };
    position: HighlightPosition;
    dropHighlight: Fn;
    acceptHighlight: Fn;
}
export declare const HeatmapHighlightModal: React.SFC<HeatmapHighlightModalProps>;
