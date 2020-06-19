"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var measure_1 = require("../../../common/models/measure/measure");
var series_format_1 = require("../../../common/models/series/series-format");
var functional_1 = require("../../../common/utils/functional/functional");
var constants_1 = require("../../config/constants");
var string_input_with_presets_1 = require("../input-with-presets/string-input-with-presets");
var PREVIEW_VALUE = 23667.25431;
function readFormat(format, measureFormat) {
    switch (format) {
        case measureFormat:
            return series_format_1.DEFAULT_FORMAT;
        case series_format_1.exactFormat:
            return series_format_1.EXACT_FORMAT;
        case series_format_1.percentFormat:
            return series_format_1.PERCENT_FORMAT;
        default:
            return series_format_1.customFormat(format);
    }
}
function printFormat(format, measureFormat) {
    switch (format.type) {
        case series_format_1.SeriesFormatType.DEFAULT:
            return measureFormat;
        case series_format_1.SeriesFormatType.EXACT:
            return series_format_1.exactFormat;
        case series_format_1.SeriesFormatType.PERCENT:
            return series_format_1.percentFormat;
        case series_format_1.SeriesFormatType.CUSTOM:
            return format.value;
    }
}
exports.FormatPicker = function (_a) {
    var format = _a.format, measure = _a.measure, formatChange = _a.formatChange;
    var measureFormat = measure.getFormat();
    var formatPresets = functional_1.concatTruthy({ name: "Default", identity: measureFormat }, measureFormat !== series_format_1.exactFormat && { name: "Exact", identity: series_format_1.exactFormat }, { name: "Percent", identity: series_format_1.percentFormat });
    function onFormatChange(format) {
        formatChange(readFormat(format, measureFormat));
    }
    return React.createElement(React.Fragment, null,
        React.createElement(string_input_with_presets_1.StringInputWithPresets, { presets: formatPresets, title: constants_1.STRINGS.format, selected: printFormat(format, measureFormat), placeholder: "Custom format e.g. " + measure_1.Measure.DEFAULT_FORMAT, onChange: onFormatChange }),
        format.type === series_format_1.SeriesFormatType.CUSTOM && React.createElement("div", { className: "format-hint" },
            "You can use custom numbro format to present measure values. Please refer to the ",
            React.createElement("a", { target: "_blank", className: "documentation-link", href: "http://numbrojs.com/old-format.html" }, "numbro documentation")),
        React.createElement("div", { className: "preview" },
            React.createElement("span", { className: "value" },
                PREVIEW_VALUE,
                " \u2192 "),
            React.createElement("span", { className: "formatted" }, series_format_1.seriesFormatter(format, measure)(PREVIEW_VALUE))));
};
//# sourceMappingURL=format-picker.js.map