import { VisualizationManifest } from "../../common/models/visualization-manifest/visualization-manifest";
import { VisualizationProps } from "../../common/models/visualization-props/visualization-props";
import { BaseVisualization, BaseVisualizationState } from "./base-visualization/base-visualization";
declare type VisualizationComponent<S extends BaseVisualizationState = BaseVisualizationState> = new (props: VisualizationProps) => BaseVisualization<S>;
export declare function getVisualizationComponent({ name }: VisualizationManifest): VisualizationComponent;
export {};
