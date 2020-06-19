"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var concrete_series_1 = require("../../../../common/models/series/concrete-series");
var general_1 = require("../../../../common/utils/general/general");
var chart_line_1 = require("./chart-line");
exports.SeriesChartLine = function (props) {
    var showArea = props.showArea, essence = props.essence, series = props.series, getX = props.getX, stage = props.stage, dataset = props.dataset, xScale = props.xScale, yScale = props.yScale, color = props.color;
    var getY = function (d) { return general_1.readNumber(series.selectValue(d)); };
    var getYP = function (d) { return general_1.readNumber(series.selectValue(d, concrete_series_1.SeriesDerivation.PREVIOUS)); };
    var hasComparison = essence.hasComparison();
    return React.createElement(React.Fragment, { key: series.reactKey() },
        React.createElement(chart_line_1.ChartLine, { key: "current", xScale: xScale, yScale: yScale, getX: getX, getY: getY, showArea: showArea, color: color, dashed: false, dataset: dataset, stage: stage }),
        hasComparison && React.createElement(chart_line_1.ChartLine, { key: "previous", xScale: xScale, yScale: yScale, getX: getX, getY: getYP, showArea: showArea, color: color, dashed: true, dataset: dataset, stage: stage }));
};
//# sourceMappingURL=series-chart-line.js.map