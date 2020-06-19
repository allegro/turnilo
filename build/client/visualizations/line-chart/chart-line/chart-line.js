"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3 = require("d3");
var React = require("react");
require("./chart-line.scss");
var prepare_data_points_1 = require("./prepare-data-points");
var stroke = function (color, dashed) { return ({
    stroke: color,
    strokeDasharray: dashed ? "4 2" : undefined
}); };
exports.ChartLine = function (props) {
    var color = props.color, dashed = props.dashed, getX = props.getX, getY = props.getY, dataset = props.dataset, showArea = props.showArea, stage = props.stage, xScale = props.xScale, yScale = props.yScale;
    var area = d3.svg.area().y0(yScale(0));
    var line = d3.svg.line();
    var points = prepare_data_points_1.prepareDataPoints(dataset, getX, getY);
    var scaledPoints = points.map(function (_a) {
        var x = _a[0], y = _a[1];
        return [xScale(x), yScale(y)];
    });
    var hasMultiplePoints = points.length > 1;
    var hasSinglePoint = points.length === 1;
    return React.createElement("g", { className: "chart-line", transform: stage.getTransform() },
        hasMultiplePoints && React.createElement("path", { className: "line", d: line(scaledPoints), style: stroke(color, dashed) }),
        hasMultiplePoints && showArea && React.createElement("path", { className: "area", d: area(scaledPoints) }),
        hasSinglePoint && React.createElement("circle", { className: "singleton", cx: scaledPoints[0][0], cy: scaledPoints[0][1], r: "2", style: { fill: color } }));
};
//# sourceMappingURL=chart-line.js.map