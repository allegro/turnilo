"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var colors_1 = require("../../../../../common/models/colors/colors");
var vis_measure_label_1 = require("../../../../components/vis-measure-label/vis-measure-label");
var base_chart_1 = require("../../base-chart/base-chart");
var colored_series_chart_line_1 = require("../../chart-line/colored-series-chart-line");
var singleton_series_chart_line_1 = require("../../chart-line/singleton-series-chart-line");
var interaction_1 = require("../../interactions/interaction");
var dataset_1 = require("../../utils/dataset");
var extent_1 = require("../../utils/extent");
var splits_1 = require("../../utils/splits");
var series_hover_content_1 = require("./series-hover-content");
exports.SeriesChart = function (props) {
    var chartId = props.chartId, interactions = props.interactions, visualisationStage = props.visualisationStage, chartStage = props.chartStage, essence = props.essence, series = props.series, xScale = props.xScale, xTicks = props.xTicks, dataset = props.dataset;
    var hasComparison = essence.hasComparison();
    var continuousSplitDataset = dataset_1.selectFirstSplitDataset(dataset);
    var interaction = interactions.interaction;
    var hoverContent = interaction_1.isHover(interaction) && React.createElement(series_hover_content_1.SeriesHoverContent, { essence: essence, dataset: continuousSplitDataset, range: interaction.range, series: series });
    var label = React.createElement(vis_measure_label_1.VisMeasureLabel, { series: series, datum: dataset_1.selectMainDatum(dataset), showPrevious: hasComparison });
    var continuousSplit = splits_1.getContinuousSplit(essence);
    var getX = function (d) { return d[continuousSplit.reference]; };
    var domain = extent_1.extentAcrossSplits(continuousSplitDataset, essence, series);
    if (splits_1.hasNominalSplit(essence)) {
        var nominalSplit_1 = splits_1.getNominalSplit(essence);
        return React.createElement(base_chart_1.BaseChart, { visualisationStage: visualisationStage, chartId: chartId, interactions: interactions, hoverContent: hoverContent, timezone: essence.timezone, label: label, xScale: xScale, xTicks: xTicks, chartStage: chartStage, formatter: series.formatter(), yDomain: domain }, function (_a) {
            var yScale = _a.yScale, lineStage = _a.lineStage;
            return React.createElement(React.Fragment, null, continuousSplitDataset.data.map(function (datum, index) {
                var splitKey = datum[nominalSplit_1.reference];
                var color = colors_1.NORMAL_COLORS[index];
                return React.createElement(colored_series_chart_line_1.ColoredSeriesChartLine, { key: String(splitKey), xScale: xScale, yScale: yScale, getX: getX, color: color, dataset: dataset_1.selectSplitDatums(datum), stage: lineStage, essence: essence, series: series });
            }));
        });
    }
    return React.createElement(base_chart_1.BaseChart, { chartId: series.plywoodKey(), visualisationStage: visualisationStage, interactions: interactions, hoverContent: hoverContent, timezone: essence.timezone, label: label, chartStage: chartStage, yDomain: domain, formatter: series.formatter(), xScale: xScale, xTicks: xTicks }, function (_a) {
        var yScale = _a.yScale, lineStage = _a.lineStage;
        return React.createElement(singleton_series_chart_line_1.SingletonSeriesChartLine, { xScale: xScale, yScale: yScale, getX: getX, dataset: continuousSplitDataset.data, stage: lineStage, essence: essence, series: series });
    });
};
//# sourceMappingURL=series-chart.js.map