import { Dataset } from "plywood";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./line-chart.scss";
export declare class LineChart extends BaseVisualization<BaseVisualizationState> {
    protected className: import("../../../common/models/visualization-manifest/visualization-manifest").Visualization;
    private chartsRef;
    protected renderInternals(dataset: Dataset): JSX.Element;
}
