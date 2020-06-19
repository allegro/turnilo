"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
require("./vertical-axis.scss");
var TEXT_OFFSET = 2;
exports.VerticalAxis = function (_a) {
    var formatter = _a.formatter, stage = _a.stage, tickSize = _a.tickSize, inputTicks = _a.ticks, scale = _a.scale, _b = _a.topLineExtend, topLineExtend = _b === void 0 ? 0 : _b, hideZero = _a.hideZero;
    var ticks = hideZero ? inputTicks.filter(function (tick) { return tick !== 0; }) : inputTicks;
    var lines = ticks.map(function (tick) {
        var y = dom_1.roundToHalfPx(scale(tick));
        return React.createElement("line", { className: "tick", key: String(tick), x1: 0, y1: y, x2: tickSize, y2: y });
    });
    var labelX = tickSize + TEXT_OFFSET;
    var dy = "0.31em";
    var labels = ticks.map(function (tick) {
        var y = scale(tick);
        return React.createElement("text", { className: "tick", key: String(tick), x: labelX, y: y, dy: dy }, formatter(tick));
    });
    return React.createElement("g", { className: "vertical-axis", transform: stage.getTransform() },
        React.createElement("line", { className: "border", x1: 0.5, y1: -topLineExtend, x2: 0.5, y2: stage.height }),
        lines,
        labels);
};
//# sourceMappingURL=vertical-axis.js.map