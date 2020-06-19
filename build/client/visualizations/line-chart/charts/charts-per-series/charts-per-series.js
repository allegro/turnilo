"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var pinboard_panel_1 = require("../../../../components/pinboard-panel/pinboard-panel");
var split_legend_1 = require("../../legend/split-legend");
var splits_1 = require("../../utils/splits");
var calculate_chart_stage_1 = require("../calculate-chart-stage");
var series_chart_1 = require("./series-chart");
exports.ChartsPerSeries = function (props) {
    var interactions = props.interactions, xScale = props.xScale, xTicks = props.xTicks, essence = props.essence, dataset = props.dataset, stage = props.stage;
    var concreteSeries = essence.getConcreteSeries().toArray();
    var chartStage = calculate_chart_stage_1.calculateChartStage(stage, essence.series.count());
    return React.createElement(React.Fragment, null,
        splits_1.hasNominalSplit(essence) && React.createElement(pinboard_panel_1.LegendSpot, null,
            React.createElement(split_legend_1.SplitLegend, { dataset: dataset, essence: essence })),
        concreteSeries.map(function (series) {
            var key = series.reactKey();
            return React.createElement(series_chart_1.SeriesChart, { interactions: interactions, key: key, chartId: key, dataset: dataset, essence: essence, series: series, chartStage: chartStage, visualisationStage: stage, xScale: xScale, xTicks: xTicks });
        }));
};
//# sourceMappingURL=charts-per-series.js.map