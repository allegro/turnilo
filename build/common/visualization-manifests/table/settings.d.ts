import { VisualizationSettingsConfig } from "../../models/visualization-settings/visualization-settings";
export declare type TableConfig = VisualizationSettingsConfig<TableSettings>;
export interface TableSettings {
    collapseRows: boolean;
}
export declare const settings: TableConfig;
