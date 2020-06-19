"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_class_1 = require("immutable-class");
var bar_chart_1 = require("./bar-chart/bar-chart");
var heat_map_1 = require("./heat-map/heat-map");
var line_chart_1 = require("./line-chart/line-chart");
var table_1 = require("./table/table");
var totals_1 = require("./totals/totals");
exports.MANIFESTS = [
    totals_1.TOTALS_MANIFEST,
    table_1.TABLE_MANIFEST,
    line_chart_1.LINE_CHART_MANIFEST,
    bar_chart_1.BAR_CHART_MANIFEST,
    heat_map_1.HEAT_MAP_MANIFEST
];
function manifestByName(visualizationName) {
    return immutable_class_1.NamedArray.findByName(exports.MANIFESTS, visualizationName);
}
exports.manifestByName = manifestByName;
//# sourceMappingURL=index.js.map