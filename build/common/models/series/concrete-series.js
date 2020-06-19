"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plywood_1 = require("plywood");
var time_shift_env_1 = require("../time-shift/time-shift-env");
var series_format_1 = require("./series-format");
var SeriesDerivation;
(function (SeriesDerivation) {
    SeriesDerivation["CURRENT"] = "";
    SeriesDerivation["PREVIOUS"] = "_previous__";
    SeriesDerivation["DELTA"] = "_delta__";
})(SeriesDerivation = exports.SeriesDerivation || (exports.SeriesDerivation = {}));
var ConcreteSeries = (function () {
    function ConcreteSeries(definition, measure) {
        this.definition = definition;
        this.measure = measure;
    }
    ConcreteSeries.prototype.equals = function (other) {
        return this.definition.equals(other.definition) && this.measure.equals(other.measure);
    };
    ConcreteSeries.prototype.reactKey = function (derivation) {
        if (derivation === void 0) { derivation = SeriesDerivation.CURRENT; }
        switch (derivation) {
            case SeriesDerivation.CURRENT:
                return this.definition.key();
            case SeriesDerivation.PREVIOUS:
                return this.definition.key() + "-previous";
            case SeriesDerivation.DELTA:
                return this.definition.key() + "-delta";
        }
    };
    ConcreteSeries.prototype.plywoodKey = function (period) {
        if (period === void 0) { period = SeriesDerivation.CURRENT; }
        return this.definition.plywoodKey(period);
    };
    ConcreteSeries.prototype.plywoodExpression = function (nestingLevel, timeShiftEnv) {
        var expression = this.measure.expression;
        switch (timeShiftEnv.type) {
            case time_shift_env_1.TimeShiftEnvType.CURRENT:
                return this.applyExpression(expression, this.definition.plywoodKey(), nestingLevel);
            case time_shift_env_1.TimeShiftEnvType.WITH_PREVIOUS: {
                var currentName = this.plywoodKey();
                var previousName = this.plywoodKey(SeriesDerivation.PREVIOUS);
                var current = this.applyExpression(this.filterMainRefs(expression, timeShiftEnv.currentFilter), currentName, nestingLevel);
                var previous = this.applyExpression(this.filterMainRefs(expression, timeShiftEnv.previousFilter), previousName, nestingLevel);
                var delta = new plywood_1.ApplyExpression({
                    name: this.plywoodKey(SeriesDerivation.DELTA),
                    expression: plywood_1.$(currentName).subtract(plywood_1.$(previousName))
                });
                return current.performAction(previous).performAction(delta);
            }
        }
    };
    ConcreteSeries.prototype.filterMainRefs = function (exp, filter) {
        return exp.substitute(function (e) {
            if (e instanceof plywood_1.RefExpression && e.name === "main") {
                return plywood_1.$("main").filter(filter);
            }
            return null;
        });
    };
    ConcreteSeries.prototype.selectValue = function (datum, period) {
        if (period === void 0) { period = SeriesDerivation.CURRENT; }
        var value = datum[this.plywoodKey(period)];
        if (typeof value === "number")
            return value;
        if (value === "NaN")
            return NaN;
        if (value === "Infinity")
            return Infinity;
        if (value === "-Infinity")
            return -Infinity;
        return NaN;
    };
    ConcreteSeries.prototype.formatter = function () {
        return series_format_1.seriesFormatter(this.definition.format, this.measure);
    };
    ConcreteSeries.prototype.formatValue = function (datum, period) {
        if (period === void 0) { period = SeriesDerivation.CURRENT; }
        var value = this.selectValue(datum, period);
        var formatter = series_format_1.seriesFormatter(this.definition.format, this.measure);
        return formatter(value);
    };
    ConcreteSeries.prototype.title = function (derivation) {
        if (derivation === void 0) { derivation = SeriesDerivation.CURRENT; }
        return "" + titleWithDerivation(this.measure, derivation);
    };
    return ConcreteSeries;
}());
exports.ConcreteSeries = ConcreteSeries;
function titleWithDerivation(_a, derivation) {
    var title = _a.title;
    switch (derivation) {
        case SeriesDerivation.CURRENT:
            return title;
        case SeriesDerivation.PREVIOUS:
            return "Previous " + title;
        case SeriesDerivation.DELTA:
            return "Difference " + title;
    }
}
exports.titleWithDerivation = titleWithDerivation;
function getNameWithDerivation(reference, derivation) {
    return "" + derivation + reference;
}
exports.getNameWithDerivation = getNameWithDerivation;
//# sourceMappingURL=concrete-series.js.map