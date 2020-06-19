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
var colors_1 = require("../../../../../common/models/colors/colors");
var concrete_series_1 = require("../../../../../common/models/series/concrete-series");
var color_swabs_1 = require("../../../../components/color-swabs/color-swabs");
var delta_1 = require("../../../../components/delta/delta");
var measure_bubble_content_1 = require("../../../../components/measure-bubble-content/measure-bubble-content");
var splits_1 = require("../../utils/splits");
var SingleSeries = function (props) {
    var series = props.series, hasComparison = props.hasComparison, datum = props.datum;
    if (!hasComparison) {
        return React.createElement(React.Fragment, null, series.formatValue(datum));
    }
    var current = series.selectValue(datum);
    var previous = series.selectValue(datum, concrete_series_1.SeriesDerivation.PREVIOUS);
    var formatter = series.formatter();
    return React.createElement(measure_bubble_content_1.MeasureBubbleContent, { current: current, previous: previous, formatter: formatter });
};
var ColoredSeries = function (props) {
    var datum = props.datum, hasComparison = props.hasComparison, series = props.series;
    var colorEntries = series.map(function (series, index) {
        var currentEntry = {
            color: colors_1.NORMAL_COLORS[index],
            name: series.title(),
            value: series.formatValue(datum)
        };
        if (!hasComparison) {
            return currentEntry;
        }
        return __assign({}, currentEntry, { previous: series.formatValue(datum, concrete_series_1.SeriesDerivation.PREVIOUS), delta: React.createElement(delta_1.Delta, { currentValue: series.selectValue(datum), previousValue: series.selectValue(datum, concrete_series_1.SeriesDerivation.PREVIOUS), formatter: series.formatter(), lowerIsBetter: series.measure.lowerIsBetter }) });
    });
    return React.createElement(color_swabs_1.ColorSwabs, { colorEntries: colorEntries });
};
exports.SplitHoverContent = function (props) {
    var essence = props.essence, dataset = props.dataset, range = props.interaction.range;
    var series = essence.getConcreteSeries().toArray();
    var hasComparison = essence.hasComparison();
    var reference = splits_1.getContinuousReference(essence);
    var datum = dataset.findDatumByAttribute(reference, range) || {};
    if (series.length === 1) {
        return React.createElement(SingleSeries, { series: series[0], datum: datum, hasComparison: hasComparison });
    }
    return React.createElement(ColoredSeries, { datum: datum, series: series, hasComparison: hasComparison });
};
//# sourceMappingURL=split-hover-content.js.map