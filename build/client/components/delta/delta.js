"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3_1 = require("d3");
var React = require("react");
var general_1 = require("../../../common/utils/general/general");
require("./delta.scss");
function formatDelta(currentValue, previousValue) {
    if (general_1.isNil(currentValue) || general_1.isNil(previousValue)) {
        return null;
    }
    var delta = currentValue - previousValue;
    var deltaSign = delta ? delta < 0 ? -1 : 1 : 0;
    var deltaRatio = Math.abs(delta / previousValue);
    return { deltaSign: deltaSign, deltaRatio: deltaRatio, delta: delta };
}
exports.formatDelta = formatDelta;
function deltaSignToSymbol(deltaSign) {
    switch (deltaSign) {
        case -1:
            return "▼";
        case 0:
            return "";
        case 1:
            return "▲";
    }
}
function deltaSignToClassName(deltaSign, lowerIsBetter) {
    if (lowerIsBetter === void 0) { lowerIsBetter = false; }
    switch (deltaSign) {
        case -1:
            return lowerIsBetter ? "delta-positive" : "delta-negative";
        case 0:
            return "delta-neutral";
        case 1:
            return lowerIsBetter ? "delta-negative" : "delta-positive";
    }
}
var percentageFormatter = d3_1.format(".1%");
function printDeltaRatio(ratio) {
    if (!isFinite(ratio))
        return null;
    return " (" + percentageFormatter(ratio) + ")";
}
exports.Delta = function (_a) {
    var lowerIsBetter = _a.lowerIsBetter, currentValue = _a.currentValue, previousValue = _a.previousValue, formatter = _a.formatter;
    var formattedDelta = formatDelta(currentValue, previousValue);
    if (formattedDelta === null) {
        return React.createElement("span", { className: "delta-neutral" }, "-");
    }
    var delta = formattedDelta.delta, deltaRatio = formattedDelta.deltaRatio, deltaSign = formattedDelta.deltaSign;
    return React.createElement("span", { className: deltaSignToClassName(deltaSign, lowerIsBetter) },
        deltaSignToSymbol(deltaSign),
        formatter(Math.abs(delta)),
        printDeltaRatio(deltaRatio));
};
//# sourceMappingURL=delta.js.map