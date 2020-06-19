"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var heatmap_1 = require("@vx/heatmap");
var React = require("react");
var constants_1 = require("../../config/constants");
var equal_props_1 = require("../../utils/equal-props/equal-props");
var heatmap_rectangle_row_1 = require("./heatmap-rectangle-row");
require("./heatmap-rectangles.scss");
var bins = function (d) { return d[constants_1.SPLIT].data; };
var HeatMapRectangles = (function (_super) {
    __extends(HeatMapRectangles, _super);
    function HeatMapRectangles() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HeatMapRectangles.prototype.shouldComponentUpdate = function (nextProps) {
        return !equal_props_1.equalProps(this.props, nextProps);
    };
    HeatMapRectangles.prototype.render = function () {
        var _a = this.props, series = _a.series, colorScale = _a.colorScale, xScale = _a.xScale, yScale = _a.yScale, gap = _a.gap, tileSize = _a.tileSize, dataset = _a.dataset;
        var height = yScale.range()[0];
        var _b = xScale.range(), width = _b[1];
        return (React.createElement("div", { className: "heatmap-rectangles-container" },
            React.createElement("svg", { width: width, height: height },
                React.createElement("rect", { x: 0, y: 0, width: width, height: height, fill: "#fff" }),
                React.createElement(heatmap_1.HeatmapRect, { bins: bins, count: function (d) { return series.selectValue(d); }, data: dataset, xScale: xScale, yScale: yScale, colorScale: colorScale, binWidth: tileSize, binHeight: tileSize, gap: gap }, function (heatmap) { return heatmap.map(function (bins) { return (React.createElement(heatmap_rectangle_row_1.HeatMapRectangleRow, { key: "heatmap-rect-row-" + bins[0].column, bins: bins })); }); }))));
    };
    return HeatMapRectangles;
}(React.Component));
exports.HeatMapRectangles = HeatMapRectangles;
//# sourceMappingURL=heatmap-rectangles.js.map