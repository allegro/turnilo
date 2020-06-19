import { Visualization } from "../../common/models/visualization-manifest/visualization-manifest";
import { LineChartSettingsComponent } from "./line-chart/line-chart-settings";
import { TableSettingsComponent } from "./table/table-settings";
interface SettingsComponents {
    "table": typeof TableSettingsComponent;
    "bar-chart": null;
    "line-chart": typeof LineChartSettingsComponent;
    "heatmap": null;
    "totals": null;
}
export declare function settingsComponent<T extends Visualization>(visualization: T): SettingsComponents[T];
export {};
