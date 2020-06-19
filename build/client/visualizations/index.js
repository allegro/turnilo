"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bar_chart_1 = require("./bar-chart/bar-chart");
var heat_map_1 = require("./heat-map/heat-map");
var line_chart_1 = require("./line-chart/line-chart");
var table_1 = require("./table/table");
var totals_1 = require("./totals/totals");
var VIS_COMPONENTS = {
    "totals": totals_1.Totals,
    "table": table_1.Table,
    "line-chart": line_chart_1.LineChart,
    "bar-chart": bar_chart_1.BarChart,
    "heatmap": heat_map_1.HeatMap
};
function getVisualizationComponent(_a) {
    var name = _a.name;
    return VIS_COMPONENTS[name];
}
exports.getVisualizationComponent = getVisualizationComponent;
//# sourceMappingURL=index.js.map