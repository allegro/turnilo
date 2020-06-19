"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
require("./color-swabs.scss");
exports.ColorSwabs = function (_a) {
    var colorEntries = _a.colorEntries;
    var colorSwabs = colorEntries.map(function (_a) {
        var color = _a.color, name = _a.name, value = _a.value, previous = _a.previous, delta = _a.delta;
        var swabStyle = { background: color };
        return React.createElement("tr", { key: name },
            React.createElement("td", null,
                React.createElement("div", { className: "color-swab", style: swabStyle })),
            React.createElement("td", { className: "color-name" }, name),
            React.createElement("td", { className: "color-value" }, value),
            previous && React.createElement("td", { className: "color-previous" }, previous),
            delta && React.createElement("td", { className: "color-delta" }, delta));
    });
    return React.createElement("table", { className: "color-swabs" },
        React.createElement("tbody", null, colorSwabs));
};
//# sourceMappingURL=color-swabs.js.map