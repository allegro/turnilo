import { Dataset, Datum, PseudoDatum } from "plywood";
import * as React from "react";
import { ScrollerPart } from "../../components/scroller/scroller";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./table.scss";
export declare const HEADER_HEIGHT = 38;
export declare const INDENT_WIDTH = 25;
export declare const ROW_HEIGHT = 30;
export declare const SPACE_LEFT = 10;
export interface TableState extends BaseVisualizationState {
    flatData?: PseudoDatum[];
    hoverRow?: Datum;
    segmentWidth: number;
}
export declare class Table extends BaseVisualization<TableState> {
    protected className: import("../../../common/models/visualization-manifest/visualization-manifest").Visualization;
    protected innerTableRef: React.RefObject<HTMLDivElement>;
    getDefaultState(): TableState;
    private getIdealColumnWidth;
    maxSegmentWidth(): number;
    getSegmentWidth(): number;
    private setSortToSeries;
    private setSortToDimension;
    private highlightRow;
    private calculateMousePosition;
    onClick: (x: number, y: number, part: ScrollerPart) => void;
    setHoverRow: (x: number, y: number, part: ScrollerPart) => void;
    resetHover: () => void;
    setScroll: (scrollTop: number, scrollLeft: number) => void;
    setSegmentWidth: (segmentWidth: number) => void;
    private flattenOptions;
    deriveDatasetState(dataset: Dataset): Partial<TableState>;
    private getScalesForColumns;
    private shouldCollapseRows;
    private highlightedRowIndex;
    protected renderInternals(): JSX.Element;
}
