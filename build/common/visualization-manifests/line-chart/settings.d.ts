import { VisualizationSettingsConfig } from "../../models/visualization-settings/visualization-settings";
export declare type LineChartVisualizationSettings = VisualizationSettingsConfig<LineChartSettings>;
export interface LineChartSettings {
    groupSeries: boolean;
}
export declare const settings: LineChartVisualizationSettings;
