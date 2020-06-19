"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var concrete_series_1 = require("../../../common/models/series/concrete-series");
var delta_1 = require("../delta/delta");
require("./vis-measure-label.scss");
function renderPrevious(datum, series) {
    var current = series.selectValue(datum, concrete_series_1.SeriesDerivation.CURRENT);
    var previous = series.selectValue(datum, concrete_series_1.SeriesDerivation.PREVIOUS);
    var formatter = series.formatter();
    return React.createElement(React.Fragment, null,
        React.createElement("span", { className: "measure-previous-value" }, formatter(previous)),
        React.createElement(delta_1.Delta, { formatter: formatter, lowerIsBetter: series.measure.lowerIsBetter, currentValue: current, previousValue: previous }));
}
exports.VisMeasureLabel = function (_a) {
    var series = _a.series, datum = _a.datum, showPrevious = _a.showPrevious;
    return React.createElement("div", { className: "vis-measure-label" },
        React.createElement("span", { className: "measure-title" }, series.title()),
        React.createElement("span", { className: "colon" }, ": "),
        React.createElement("span", { className: "measure-value" }, series.formatValue(datum)),
        showPrevious && renderPrevious(datum, series));
};
//# sourceMappingURL=vis-measure-label.js.map