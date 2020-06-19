"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var plywood_1 = require("plywood");
var concrete_series_1 = require("./concrete-series");
var series_format_1 = require("./series-format");
var series_type_1 = require("./series-type");
var defaultQuantileSeries = {
    format: series_format_1.DEFAULT_FORMAT,
    percentile: 95,
    reference: null,
    type: series_type_1.SeriesType.QUANTILE
};
var QuantileSeries = (function (_super) {
    __extends(QuantileSeries, _super);
    function QuantileSeries(params) {
        return _super.call(this, params) || this;
    }
    QuantileSeries.fromJS = function (_a) {
        var type = _a.type, reference = _a.reference, percentile = _a.percentile, format = _a.format;
        return new QuantileSeries({
            type: type,
            reference: reference,
            percentile: percentile,
            format: series_format_1.SeriesFormat.fromJS(format)
        });
    };
    QuantileSeries.fromQuantileMeasure = function (_a) {
        var reference = _a.name, expression = _a.expression;
        if (!(expression instanceof plywood_1.QuantileExpression))
            throw new Error("Expected QuantileExpression, got " + expression);
        return new QuantileSeries({
            reference: reference,
            percentile: expression.value * 100
        });
    };
    QuantileSeries.prototype.formattedPercentile = function () {
        return this.percentile.toString();
    };
    QuantileSeries.prototype.key = function () {
        return this.reference + "__p" + this.formattedPercentile();
    };
    QuantileSeries.prototype.plywoodKey = function (derivation) {
        if (derivation === void 0) { derivation = concrete_series_1.SeriesDerivation.CURRENT; }
        return concrete_series_1.getNameWithDerivation(this.key(), derivation);
    };
    return QuantileSeries;
}(immutable_1.Record(defaultQuantileSeries)));
exports.QuantileSeries = QuantileSeries;
//# sourceMappingURL=quantile-series.js.map