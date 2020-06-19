"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var format_picker_1 = require("./format-picker");
exports.MeasureSeriesMenu = function (_a) {
    var measure = _a.measure, series = _a.series, onChange = _a.onChange;
    function onFormatChange(format) {
        onChange(series.set("format", format), true);
    }
    return React.createElement(React.Fragment, null,
        React.createElement(format_picker_1.FormatPicker, { measure: measure, format: series.format, formatChange: onFormatChange }));
};
//# sourceMappingURL=measure-series-menu.js.map