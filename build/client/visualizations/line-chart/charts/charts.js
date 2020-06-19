"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var charts_per_series_1 = require("./charts-per-series/charts-per-series");
var charts_per_split_1 = require("./charts-per-split/charts-per-split");
exports.Charts = function (props) {
    var essence = props.essence;
    var groupSeries = essence.visualizationSettings.groupSeries;
    return groupSeries
        ? React.createElement(charts_per_split_1.ChartsPerSplit, __assign({}, props))
        : React.createElement(charts_per_series_1.ChartsPerSeries, __assign({}, props));
};
//# sourceMappingURL=charts.js.map