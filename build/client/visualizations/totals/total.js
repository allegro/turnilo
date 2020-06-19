"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var concrete_series_1 = require("../../../common/models/series/concrete-series");
var delta_1 = require("../../components/delta/delta");
require("./total.scss");
var Difference = function (_a) {
    var datum = _a.datum, series = _a.series;
    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "measure-value measure-value--previous" }, series.formatValue(datum, concrete_series_1.SeriesDerivation.PREVIOUS)),
        React.createElement("div", { className: "measure-delta-value" },
            React.createElement(delta_1.Delta, { previousValue: series.selectValue(datum, concrete_series_1.SeriesDerivation.PREVIOUS), currentValue: series.selectValue(datum, concrete_series_1.SeriesDerivation.CURRENT), lowerIsBetter: series.measure.lowerIsBetter, formatter: series.formatter() })));
};
exports.Total = function (_a) {
    var showPrevious = _a.showPrevious, datum = _a.datum, series = _a.series;
    return React.createElement("div", { className: "total" },
        React.createElement("div", { className: "measure-name", title: series.title() }, series.title()),
        React.createElement("div", { className: "measure-value" }, series.formatValue(datum, concrete_series_1.SeriesDerivation.CURRENT)),
        showPrevious && React.createElement(Difference, { series: series, datum: datum }));
};
//# sourceMappingURL=total.js.map