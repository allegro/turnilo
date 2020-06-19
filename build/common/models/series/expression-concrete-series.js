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
var concrete_series_1 = require("./concrete-series");
var ExpressionConcreteSeries = (function (_super) {
    __extends(ExpressionConcreteSeries, _super);
    function ExpressionConcreteSeries(series, measure, measures) {
        var _this = _super.call(this, series, measure) || this;
        _this.expression = _this.definition.expression.toConcreteExpression(measures);
        return _this;
    }
    ExpressionConcreteSeries.prototype.reactKey = function (derivation) {
        return _super.prototype.reactKey.call(this, derivation) + "-" + this.definition.expression.key();
    };
    ExpressionConcreteSeries.prototype.title = function (derivation) {
        return _super.prototype.title.call(this, derivation) + " " + this.expression.title();
    };
    ExpressionConcreteSeries.prototype.applyExpression = function (expression, name, nestingLevel) {
        return this.expression.toExpression(expression, name, nestingLevel);
    };
    return ExpressionConcreteSeries;
}(concrete_series_1.ConcreteSeries));
exports.ExpressionConcreteSeries = ExpressionConcreteSeries;
//# sourceMappingURL=expression-concrete-series.js.map