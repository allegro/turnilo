"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var line_chart_settings_1 = require("./line-chart/line-chart-settings");
var table_settings_1 = require("./table/table-settings");
var Components = {
    "bar-chart": null,
    "line-chart": line_chart_settings_1.LineChartSettingsComponent,
    "heatmap": null,
    "totals": null,
    "table": table_settings_1.TableSettingsComponent
};
function settingsComponent(visualization) {
    return Components[visualization];
}
exports.settingsComponent = settingsComponent;
//# sourceMappingURL=settings-component.js.map