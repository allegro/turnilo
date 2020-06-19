/// <reference path="../../../../src/client/index.d.ts" />
import { Dataset } from "plywood";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./heat-map.scss";
import scales from "./utils/scales";
interface HeatmapState extends BaseVisualizationState {
    preparedDataset: Dataset;
}
export declare class HeatMap extends BaseVisualization<HeatmapState> {
    protected className: import("../../../common/models/visualization-manifest/visualization-manifest").Visualization;
    getScales: typeof scales;
    series(): ConcreteSeries;
    renderInternals(): JSX.Element;
    deriveDatasetState(dataset: Dataset): Partial<HeatmapState>;
}
export {};
