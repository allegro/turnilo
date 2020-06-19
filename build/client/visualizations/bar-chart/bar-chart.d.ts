import * as d3 from "d3";
import { Dataset, Datum, PseudoDatum } from "plywood";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { ScrollerLayout } from "../../components/scroller/scroller";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./bar-chart.scss";
import { BarCoordinates } from "./bar-coordinates";
export interface BubbleInfo {
    series: ConcreteSeries;
    chartIndex: number;
    path: Datum[];
    coordinates: BarCoordinates;
    splitIndex?: number;
    segmentLabel?: string;
}
export interface BarChartState extends BaseVisualizationState {
    hoverInfo?: BubbleInfo;
    selectionInfo?: BubbleInfo;
    scrollerYPosition?: number;
    scrollerXPosition?: number;
    flatData?: PseudoDatum[];
    maxNumberOfLeaves?: number[];
}
export declare class BarChart extends BaseVisualization<BarChartState> {
    protected className: import("../../../common/models/visualization-manifest/visualization-manifest").Visualization;
    private coordinatesCache;
    private scroller;
    getDefaultState(): BarChartState;
    componentDidUpdate(): void;
    calculateMousePosition(x: number, y: number): BubbleInfo;
    findPathForIndices(indices: number[]): Datum[];
    findBarCoordinatesForX(x: number, coordinates: BarCoordinates[], currentPath: number[]): {
        path: number[];
        coordinates: BarCoordinates;
    };
    onScrollerScroll: (scrollTop: number, scrollLeft: number) => void;
    onMouseMove: (x: number, y: number) => void;
    onMouseLeave: () => void;
    onClick: (x: number, y: number) => void;
    getYExtent(data: Datum[], series: ConcreteSeries): number[];
    getYScale(series: ConcreteSeries, yAxisStage: Stage): d3.scale.Linear<number, number>;
    hasValidYExtent(series: ConcreteSeries, data: Datum[]): boolean;
    getSingleChartStage(): Stage;
    getOuterChartHeight(chartStage: Stage): number;
    getAxisStages(chartStage: Stage): {
        xAxisStage: Stage;
        yAxisStage: Stage;
    };
    getScrollerLayout(chartStage: Stage, xAxisStage: Stage, yAxisStage: Stage): ScrollerLayout;
    getBubbleTopOffset(y: number, chartIndex: number, chartStage: Stage): number;
    getBubbleLeftOffset(x: number): number;
    canShowBubble(leftOffset: number, topOffset: number): boolean;
    renderSelectionBubble(hoverInfo: BubbleInfo): JSX.Element;
    renderHoverBubble(hoverInfo: BubbleInfo): JSX.Element;
    private renderMeasureLabel;
    isSelected(path: Datum[], series: Series): boolean;
    isFaded(): boolean;
    hasAnySelectionGoingOn(): boolean;
    isHovered(path: Datum[], series: ConcreteSeries): boolean;
    renderBars(data: Datum[], series: ConcreteSeries, chartIndex: number, chartStage: Stage, xAxisStage: Stage, coordinates: BarCoordinates[], splitIndex?: number, path?: Datum[]): {
        bars: JSX.Element[];
        highlight: JSX.Element;
    };
    renderSelectionHighlight(chartStage: Stage, coordinates: BarCoordinates, chartIndex: number): JSX.Element;
    renderXAxis(data: Datum[], coordinates: BarCoordinates[], xAxisStage: Stage): JSX.Element;
    getYAxisStuff(dataset: Dataset, series: ConcreteSeries, chartStage: Stage, chartIndex: number): {
        yGridLines: JSX.Element;
        yAxis: JSX.Element;
        yScale: d3.scale.Linear<number, number>;
    };
    isChartVisible(chartIndex: number, xAxisStage: Stage): boolean;
    renderChart(dataset: Dataset, coordinates: BarCoordinates[], series: ConcreteSeries, chartIndex: number, chartStage: Stage): {
        yAxis: JSX.Element;
        chart: JSX.Element;
        highlight: JSX.Element;
    };
    deriveDatasetState(dataset: Dataset): Partial<BarChartState>;
    maxNumberOfLeaves(data: Datum[], maxima: number[], level: number): void;
    getPrimaryXScale(): d3.scale.Ordinal<string, number>;
    getBarDimensions(xRangeBand: number): {
        stepWidth: number;
        barWidth: number;
        barOffset: number;
    };
    getXValues(maxNumberOfLeaves: number[]): {
        padLeft: number;
        usedWidth: number;
    };
    getBarsCoordinates(chartIndex: number, xScale: d3.scale.Ordinal<string, number>): BarCoordinates[];
    getSubCoordinates(data: Datum[], series: ConcreteSeries, chartStage: Stage, getX: (d: Datum, i: number) => string, xScale: d3.scale.Ordinal<string, number>, scaleY: d3.scale.Linear<number, number>, splitIndex?: number): BarCoordinates[];
    renderRightGutter(seriesCount: number, yAxisStage: Stage, yAxes: JSX.Element[]): JSX.Element;
    renderSelectionContainer(selectionHighlight: JSX.Element, chartIndex: number, chartStage: Stage): JSX.Element;
    renderInternals(dataset: Dataset): JSX.Element;
}
