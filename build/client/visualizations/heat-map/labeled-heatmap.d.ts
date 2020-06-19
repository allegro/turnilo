import { List } from "immutable";
import { Datum } from "plywood";
import * as React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { FilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { ScrollerPart } from "../../components/scroller/scroller";
import { Highlight } from "../base-visualization/highlight";
import "./heat-map.scss";
import { HoverPosition } from "./utils/get-hover-position";
import { ColorScale, LinearScale } from "./utils/scales";
interface LabelledHeatmapProps {
    stage: Stage;
    essence: Essence;
    dataset: Datum[];
    xScale: LinearScale;
    yScale: LinearScale;
    colorScale: ColorScale;
    highlight: Highlight | null;
    saveHighlight: Unary<List<FilterClause>, void>;
    dropHighlight: Fn;
    acceptHighlight: Fn;
}
interface LabelledHeatmapState {
    scrollLeft: number;
    scrollTop: number;
    hoverPosition: HoverPosition | null;
    leftLabelsWidth: number;
    topLabelsHeight: number;
}
export declare const TILE_SIZE = 25;
export declare const TILE_GAP = 2;
export declare const MIN_LEFT_LABELS_WIDTH = 100;
export declare const MAX_LEFT_LABELS_WIDTH = 200;
export declare const MIN_TOP_LABELS_HEIGHT = 100;
export declare const MAX_TOP_LABELS_HEIGHT = 150;
export declare class LabelledHeatmap extends React.PureComponent<LabelledHeatmapProps, LabelledHeatmapState> {
    state: LabelledHeatmapState;
    saveHover: (x: number, y: number, part: ScrollerPart) => void;
    resetHover: () => void;
    saveScroll: (scrollTop: number, scrollLeft: number) => void;
    saveLeftLabelWidth: (maxLabelWidth: number) => void;
    saveTopLabelHeight: (maxLabelHeight: number) => void;
    handleHighlight: (x: number, y: number, part: ScrollerPart) => void;
    private layout;
    render(): JSX.Element;
}
export {};
