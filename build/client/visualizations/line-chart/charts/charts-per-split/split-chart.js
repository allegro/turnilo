"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var colors_1 = require("../../../../../common/models/colors/colors");
var series_format_1 = require("../../../../../common/models/series/series-format");
var base_chart_1 = require("../../base-chart/base-chart");
var colored_series_chart_line_1 = require("../../chart-line/colored-series-chart-line");
var singleton_series_chart_line_1 = require("../../chart-line/singleton-series-chart-line");
var interaction_1 = require("../../interactions/interaction");
var dataset_1 = require("../../utils/dataset");
var extent_1 = require("../../utils/extent");
var splits_1 = require("../../utils/splits");
var label_1 = require("./label");
var split_hover_content_1 = require("./split-hover-content");
exports.SplitChart = function (props) {
    var chartId = props.chartId, interactions = props.interactions, visualisationStage = props.visualisationStage, chartStage = props.chartStage, essence = props.essence, xScale = props.xScale, xTicks = props.xTicks, selectDatum = props.selectDatum, dataset = props.dataset;
    var interaction = interactions.interaction;
    var splitDatum = selectDatum(dataset);
    var splitDataset = dataset_1.selectSplitDataset(splitDatum);
    var series = essence.getConcreteSeries();
    var label = React.createElement(label_1.Label, { essence: essence, datum: splitDatum });
    var hoverContent = interaction_1.isHover(interaction) && React.createElement(split_hover_content_1.SplitHoverContent, { interaction: interaction, essence: essence, dataset: splitDataset });
    var continuousSplit = splits_1.getContinuousSplit(essence);
    var getX = function (d) { return d[continuousSplit.reference]; };
    var domain = extent_1.extentAcrossSeries(splitDataset, essence);
    if (series.count() === 1) {
        var firstSeries_1 = series.first();
        return React.createElement(base_chart_1.BaseChart, { chartId: chartId, interactions: interactions, hoverContent: hoverContent, timezone: essence.timezone, label: label, xScale: xScale, xTicks: xTicks, chartStage: chartStage, formatter: firstSeries_1.formatter(), yDomain: domain, visualisationStage: visualisationStage }, function (_a) {
            var yScale = _a.yScale, lineStage = _a.lineStage;
            return React.createElement(singleton_series_chart_line_1.SingletonSeriesChartLine, { xScale: xScale, yScale: yScale, getX: getX, dataset: splitDataset.data, stage: lineStage, essence: essence, series: firstSeries_1 });
        });
    }
    return React.createElement(base_chart_1.BaseChart, { chartId: chartId, visualisationStage: visualisationStage, timezone: essence.timezone, hoverContent: hoverContent, interactions: interactions, label: label, xScale: xScale, xTicks: xTicks, chartStage: chartStage, formatter: series_format_1.defaultFormatter, yDomain: domain }, function (_a) {
        var yScale = _a.yScale, lineStage = _a.lineStage;
        return React.createElement(React.Fragment, null, series.toArray().map(function (series, index) {
            var color = colors_1.NORMAL_COLORS[index];
            return React.createElement(colored_series_chart_line_1.ColoredSeriesChartLine, { key: series.plywoodKey(), xScale: xScale, yScale: yScale, getX: getX, dataset: splitDataset.data, stage: lineStage, essence: essence, series: series, color: color });
        }));
    });
};
//# sourceMappingURL=split-chart.js.map