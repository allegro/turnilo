"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var colors_1 = require("../../../../common/models/colors/colors");
require("./legend.scss");
var LegendValues = function (props) {
    var values = props.values;
    return React.createElement("div", { className: "legend-values" },
        React.createElement("table", { className: "legend-values-table" },
            React.createElement("tbody", null, values.map(function (value, i) {
                var style = { background: colors_1.NORMAL_COLORS[i] };
                return React.createElement("tr", { key: value, className: "legend-value" },
                    React.createElement("td", { className: "legend-value-color-cell" },
                        React.createElement("div", { className: "legend-value-color", style: style })),
                    React.createElement("td", { className: "legend-value-label" },
                        React.createElement("span", { className: "legend-value-name" }, value)));
            }))));
};
exports.Legend = function (props) {
    var values = props.values, title = props.title;
    return React.createElement("div", { className: "line-chart-legend" },
        React.createElement("div", { className: "legend-header" }, title),
        React.createElement(LegendValues, { values: values }));
};
//# sourceMappingURL=legend.js.map