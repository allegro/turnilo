import { Dataset } from "plywood";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./totals.scss";
export declare class Totals extends BaseVisualization<BaseVisualizationState> {
    protected className: import("../../../common/models/visualization-manifest/visualization-manifest").Visualization;
    renderTotals(dataset: Dataset): JSX.Element[];
    renderInternals(dataset: Dataset): JSX.Element;
}
