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
var series_chart_line_1 = require("./series-chart-line");
exports.SingletonSeriesChartLine = function (props) {
    return React.createElement(series_chart_line_1.SeriesChartLine, __assign({}, props, { showArea: true }));
};
//# sourceMappingURL=singleton-series-chart-line.js.map