import { VisualizationManifest } from "../../models/visualization-manifest/visualization-manifest";
import { VisualizationSettings } from "../../models/visualization-settings/visualization-settings";
export declare function fromViewDefinition(visualization: VisualizationManifest, settings?: object): VisualizationSettings;
export declare function toViewDefinition(visualization: VisualizationManifest, settings: object): object;
