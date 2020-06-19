"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var grid_lines_1 = require("../../../../components/grid-lines/grid-lines");
var vertical_axis_1 = require("../../../../components/vertical-axis/vertical-axis");
var y_scale_1 = require("../y-scale");
require("./background.scss");
var bottom_border_1 = require("./bottom-border");
function calculateTicks(scale) {
    return scale.ticks(y_scale_1.TICKS_COUNT).filter(function (n) { return n !== 0; });
}
exports.Background = function (props) {
    var formatter = props.formatter, gridStage = props.gridStage, axisStage = props.axisStage, xScale = props.xScale, yScale = props.yScale, xTicks = props.xTicks;
    return React.createElement(React.Fragment, null,
        React.createElement(grid_lines_1.GridLines, { orientation: "horizontal", scale: yScale, ticks: calculateTicks(yScale), stage: gridStage }),
        React.createElement(grid_lines_1.GridLines, { orientation: "vertical", scale: xScale, ticks: xTicks, stage: gridStage }),
        React.createElement(vertical_axis_1.VerticalAxis, { tickSize: y_scale_1.TICK_WIDTH, stage: axisStage, formatter: formatter, ticks: calculateTicks(yScale), scale: yScale }),
        React.createElement(bottom_border_1.BottomBorder, { stage: gridStage }));
};
//# sourceMappingURL=background.js.map