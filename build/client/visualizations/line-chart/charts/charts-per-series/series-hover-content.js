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
var functional_1 = require("../../../../../common/utils/functional/functional");
var color_swabs_1 = require("../../../../components/color-swabs/color-swabs");
var delta_1 = require("../../../../components/delta/delta");
var measure_bubble_content_1 = require("../../../../components/measure-bubble-content/measure-bubble-content");
var dataset_1 = require("../../utils/dataset");
var splits_1 = require("../../utils/splits");
function findNestedDatumByAttribute(dimensionName, range) {
    return function (d) {
        var dataset = dataset_1.selectSplitDataset(d);
        return dataset != null ? dataset.findDatumByAttribute(dimensionName, range) : null;
    };
}
function measureLabel(dataset, range, series, essence) {
    var continuousDimension = splits_1.getContinuousDimension(essence);
    var datum = dataset.findDatumByAttribute(continuousDimension.name, range);
    if (!datum)
        return null;
    if (!essence.hasComparison()) {
        return series.formatValue(datum);
    }
    var currentValue = series.selectValue(datum);
    var previousValue = series.selectValue(datum, concrete_series_1.SeriesDerivation.PREVIOUS);
    var formatter = series.formatter();
    return React.createElement(measure_bubble_content_1.MeasureBubbleContent, { lowerIsBetter: series.measure.lowerIsBetter, current: currentValue, previous: previousValue, formatter: formatter });
}
function colorEntries(dataset, range, series, essence) {
    var categorySplit = splits_1.getNominalSplit(essence);
    var continuousRef = splits_1.getContinuousReference(essence);
    var hoverDatums = dataset.data.map(findNestedDatumByAttribute(continuousRef, range));
    var colorValues = colors_1.NORMAL_COLORS;
    var hasComparison = essence.hasComparison();
    return functional_1.mapTruthy(dataset.data, function (d, i) {
        var segment = d[categorySplit.reference];
        var hoverDatum = hoverDatums[i];
        if (!hoverDatum)
            return null;
        var currentEntry = {
            color: colorValues[i],
            name: String(segment),
            value: series.formatValue(hoverDatum)
        };
        if (!hasComparison) {
            return currentEntry;
        }
        return __assign({}, currentEntry, { previous: series.formatValue(hoverDatum, concrete_series_1.SeriesDerivation.PREVIOUS), delta: React.createElement(delta_1.Delta, { currentValue: series.selectValue(hoverDatum), previousValue: series.selectValue(hoverDatum, concrete_series_1.SeriesDerivation.PREVIOUS), formatter: series.formatter(), lowerIsBetter: series.measure.lowerIsBetter }) });
    });
}
exports.SeriesHoverContent = function (props) {
    var essence = props.essence, range = props.range, series = props.series, dataset = props.dataset;
    if (splits_1.hasNominalSplit(essence)) {
        var entries = colorEntries(dataset, range, series, essence);
        return React.createElement(color_swabs_1.ColorSwabs, { colorEntries: entries });
    }
    return React.createElement(React.Fragment, null, measureLabel(dataset, range, series, essence));
};
//# sourceMappingURL=series-hover-content.js.map