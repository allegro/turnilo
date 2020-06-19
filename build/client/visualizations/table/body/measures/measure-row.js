"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../../../utils/dom/dom");
require("./measure-row.scss");
var measure_value_1 = require("./measure-value");
exports.MeasureRow = function (props) {
    var datum = props.datum, scales = props.scales, cellWidth = props.cellWidth, highlight = props.highlight, dimmed = props.dimmed, style = props.style, essence = props.essence;
    var concreteSeries = essence.getConcreteSeries().toArray();
    var splitLength = essence.splits.length();
    return React.createElement("div", { className: dom_1.classNames("measure-row", { highlight: highlight, dimmed: dimmed }), style: style }, concreteSeries.map(function (series, i) {
        return React.createElement(measure_value_1.MeasureValue, { key: series.reactKey(), series: series, datum: datum, highlight: highlight, scale: scales[i], cellWidth: cellWidth, lastLevel: datum["__nest"] === splitLength, showPrevious: essence.hasComparison() });
    }));
};
//# sourceMappingURL=measure-row.js.map