"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var delta_1 = require("../delta/delta");
require("./measure-bubble-content.scss");
exports.MeasureBubbleContent = function (_a) {
    var lowerIsBetter = _a.lowerIsBetter, formatter = _a.formatter, current = _a.current, previous = _a.previous;
    var currentValue = formatter(current);
    var previousValue = formatter(previous);
    return React.createElement(React.Fragment, null,
        React.createElement("strong", { className: "current-value" }, currentValue),
        React.createElement("span", { className: "previous-value" }, previousValue),
        React.createElement(delta_1.Delta, { formatter: formatter, currentValue: current, previousValue: previous, lowerIsBetter: lowerIsBetter }));
};
//# sourceMappingURL=measure-bubble-content.js.map