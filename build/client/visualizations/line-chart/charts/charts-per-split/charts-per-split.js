"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var functional_1 = require("../../../../../common/utils/functional/functional");
var pinboard_panel_1 = require("../../../../components/pinboard-panel/pinboard-panel");
var series_legend_1 = require("../../legend/series-legend");
var dataset_1 = require("../../utils/dataset");
var splits_1 = require("../../utils/splits");
var calculate_chart_stage_1 = require("../calculate-chart-stage");
var nominal_value_key_1 = require("./nominal-value-key");
var split_chart_1 = require("./split-chart");
function getChartsSelectors(essence, dataset) {
    if (!splits_1.hasNominalSplit(essence)) {
        return [dataset_1.selectMainDatum];
    }
    var splitDatums = dataset_1.selectFirstSplitDatums(dataset);
    return splitDatums.map(function (datum, index) {
        var getNthDatum = functional_1.compose(dataset_1.selectSplitDatums, function (datums) { return datums[index]; });
        return functional_1.compose(dataset_1.selectMainDatum, getNthDatum);
    });
}
exports.ChartsPerSplit = function (props) {
    var interactions = props.interactions, xScale = props.xScale, xTicks = props.xTicks, essence = props.essence, dataset = props.dataset, stage = props.stage;
    var hasMultipleSeries = essence.series.count() > 1;
    var selectors = getChartsSelectors(essence, dataset);
    var chartStage = calculate_chart_stage_1.calculateChartStage(stage, selectors.length);
    return React.createElement(React.Fragment, null,
        hasMultipleSeries && React.createElement(pinboard_panel_1.LegendSpot, null,
            React.createElement(series_legend_1.SeriesLegend, { essence: essence })),
        selectors.map(function (selector) {
            var key = nominal_value_key_1.nominalValueKey(selector(dataset), essence);
            return React.createElement(split_chart_1.SplitChart, { key: key, chartId: key, interactions: interactions, essence: essence, dataset: dataset, selectDatum: selector, xScale: xScale, xTicks: xTicks, visualisationStage: stage, chartStage: chartStage });
        }));
};
//# sourceMappingURL=charts-per-split.js.map