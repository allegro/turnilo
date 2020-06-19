"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var format_picker_1 = require("./format-picker");
var quantile_picker_1 = require("./quantile-picker");
require("./quantile-series-menu.scss");
var percentiles = [
    { identity: 50, name: "50" },
    { identity: 75, name: "75" },
    { identity: 90, name: "90" },
    { identity: 95, name: "95" },
    { identity: 99, name: "99" }
];
exports.QuantileSeriesMenu = function (_a) {
    var seriesList = _a.seriesList, initialSeries = _a.initialSeries, measure = _a.measure, series = _a.series, onChange = _a.onChange;
    function validateSeries(series) {
        if (series.percentile <= 0 || series.percentile >= 100) {
            return "Percentile must be a number greater than 0 and lower than 100";
        }
        if (!series.equals(initialSeries) && seriesList.hasSeries(series)) {
            return "This percentile is already define for this measure";
        }
        return null;
    }
    function isSeriesValid(series) {
        return validateSeries(series) === null;
    }
    function onSeriesChange(series) {
        onChange(series, isSeriesValid(series));
    }
    function onFormatChange(format) {
        onSeriesChange(series.set("format", format));
    }
    function onPercentileChange(percentile) {
        onSeriesChange(series.set("percentile", percentile));
    }
    var error = validateSeries(series);
    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "percentile-picker" },
            React.createElement(quantile_picker_1.QuantilePicker, { title: "Percentile", placeholder: "Type percentile e.g. 55", selected: series.percentile, presets: percentiles, errorMessage: error, onChange: onPercentileChange })),
        React.createElement(format_picker_1.FormatPicker, { measure: measure, format: series.format, formatChange: onFormatChange }));
};
//# sourceMappingURL=quantile-series-menu.js.map