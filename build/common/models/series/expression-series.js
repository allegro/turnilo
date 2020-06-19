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
var expression_1 = require("../expression/expression");
var concrete_series_1 = require("./concrete-series");
var series_format_1 = require("./series-format");
var series_type_1 = require("./series-type");
var defaultSeries = {
    reference: null,
    format: series_format_1.DEFAULT_FORMAT,
    type: series_type_1.SeriesType.EXPRESSION,
    expression: null
};
var ExpressionSeries = (function (_super) {
    __extends(ExpressionSeries, _super);
    function ExpressionSeries(params) {
        return _super.call(this, params) || this;
    }
    ExpressionSeries.fromJS = function (_a) {
        var type = _a.type, reference = _a.reference, expression = _a.expression, format = _a.format;
        return new ExpressionSeries({
            type: type,
            reference: reference,
            expression: expression_1.fromJS(expression),
            format: series_format_1.SeriesFormat.fromJS(format)
        });
    };
    ExpressionSeries.prototype.key = function () {
        return this.reference + "__" + this.expression.key();
    };
    ExpressionSeries.prototype.plywoodKey = function (period) {
        if (period === void 0) { period = concrete_series_1.SeriesDerivation.CURRENT; }
        return concrete_series_1.getNameWithDerivation(this.key(), period);
    };
    return ExpressionSeries;
}(immutable_1.Record(defaultSeries)));
exports.ExpressionSeries = ExpressionSeries;
//# sourceMappingURL=expression-series.js.map