"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var legend_1 = require("./legend");
exports.SeriesLegend = function (props) {
    var essence = props.essence;
    var series = essence.getConcreteSeries().toArray();
    var values = series.map(function (series) { return series.title(); });
    return React.createElement(legend_1.Legend, { values: values, title: "Series" });
};
//# sourceMappingURL=series-legend.js.map