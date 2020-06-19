"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
require("./heatmap-corner.scss");
var heatmap_legend_1 = require("./heatmap-legend");
var labelMargin = 20;
var labelOffset = 40;
var rotationAxisOffset = 7;
exports.HeatmapCorner = function (_a) {
    var colorScale = _a.colorScale, width = _a.width, height = _a.height, essence = _a.essence;
    var dataCube = essence.dataCube, splits = essence.splits.splits;
    var row = splits.get(0);
    var column = splits.get(1);
    var rowTitle = row.getTitle(dataCube.getDimension(row.reference));
    var columnTitle = column.getTitle(dataCube.getDimension(column.reference));
    var series = essence.getConcreteSeries().first();
    var legendHeight = height - labelOffset;
    var legendWidth = width - labelOffset;
    return React.createElement("div", { className: "heatmap-corner" },
        React.createElement(heatmap_legend_1.HeatmapLegend, { scale: colorScale, height: legendHeight, width: legendWidth, series: series }),
        React.createElement("div", { className: "heatmap-corner-row-title" },
            React.createElement("span", { className: "heatmap-corner-overflow-label", style: { width: width - labelMargin + "px" } }, rowTitle)),
        React.createElement("div", { className: "heatmap-corner-column-title", style: { left: width - labelMargin + rotationAxisOffset + "px" } },
            React.createElement("span", { className: "heatmap-corner-overflow-label", style: { width: height - labelMargin + "px" } }, columnTitle)));
};
//# sourceMappingURL=heatmap-corner.js.map