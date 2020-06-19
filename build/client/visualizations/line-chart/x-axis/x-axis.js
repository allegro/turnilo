"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3 = require("d3");
var React = require("react");
var stage_1 = require("../../../../common/models/stage/stage");
var time_1 = require("../../../../common/utils/time/time");
var dom_1 = require("../../../utils/dom/dom");
require("./x-axis.scss");
var TICK_HEIGHT = 5;
var TEXT_OFFSET = 12;
var X_AXIS_HEIGHT = 30;
var floatFormat = d3.format(".1f");
function labelFormatter(scale, timezone) {
    var start = scale.domain()[0];
    if (start instanceof Date) {
        var formatter_1 = time_1.scaleTicksFormatter(scale);
        return function (date) { return formatter_1(time_1.getMoment(date, timezone)); };
    }
    return function (value) { return String(floatFormat(value)); };
}
exports.XAxis = function (props) {
    var width = props.width, ticks = props.ticks, scale = props.scale, timezone = props.timezone;
    var stage = stage_1.Stage.fromSize(width, X_AXIS_HEIGHT);
    var format = labelFormatter(scale, timezone);
    var lines = ticks.map(function (tick) {
        var x = dom_1.roundToHalfPx(scale(tick));
        return React.createElement("line", { key: String(tick), x1: x, y1: 0, x2: x, y2: TICK_HEIGHT });
    });
    var labelY = TICK_HEIGHT + TEXT_OFFSET;
    var labels = ticks.map(function (tick, index) {
        var x = scale(tick);
        return React.createElement("text", { key: String(tick), x: x, y: labelY, style: { textAnchor: index === 0 ? "start" : "middle" } }, format(tick));
    });
    return React.createElement("svg", { className: "bottom-axis", width: stage.width, height: stage.height },
        React.createElement("g", { className: "line-chart-axis", transform: stage.getTransform() },
            lines,
            labels));
};
//# sourceMappingURL=x-axis.js.map