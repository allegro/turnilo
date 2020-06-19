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
var plywood_1 = require("plywood");
var general_1 = require("../../utils/general/general");
var expression_series_1 = require("./expression-series");
var measure_series_1 = require("./measure-series");
var quantile_series_1 = require("./quantile-series");
var series_type_1 = require("./series-type");
function fromMeasure(measure) {
    if (measure.expression instanceof plywood_1.QuantileExpression) {
        return quantile_series_1.QuantileSeries.fromQuantileMeasure(measure);
    }
    return measure_series_1.MeasureSeries.fromMeasure(measure);
}
exports.fromMeasure = fromMeasure;
function inferTypeAndConstruct(_a, params) {
    var expression = _a.expression;
    if (expression instanceof plywood_1.QuantileExpression) {
        return quantile_series_1.QuantileSeries.fromJS(__assign({}, params, { type: series_type_1.SeriesType.QUANTILE }));
    }
    return measure_series_1.MeasureSeries.fromJS(__assign({}, params, { type: series_type_1.SeriesType.MEASURE }));
}
function fromJS(params, measure) {
    var type = params.type;
    if (!general_1.isTruthy(type))
        return inferTypeAndConstruct(measure, params);
    switch (type) {
        case series_type_1.SeriesType.MEASURE:
            return inferTypeAndConstruct(measure, params);
        case series_type_1.SeriesType.EXPRESSION:
            return expression_series_1.ExpressionSeries.fromJS(params);
        case series_type_1.SeriesType.QUANTILE:
            return quantile_series_1.QuantileSeries.fromJS(params);
    }
}
exports.fromJS = fromJS;
//# sourceMappingURL=series.js.map