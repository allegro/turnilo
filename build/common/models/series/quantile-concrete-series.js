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
var concrete_series_1 = require("./concrete-series");
var QuantileConcreteSeries = (function (_super) {
    __extends(QuantileConcreteSeries, _super);
    function QuantileConcreteSeries(series, measure) {
        return _super.call(this, series, measure) || this;
    }
    QuantileConcreteSeries.prototype.title = function (derivation) {
        return _super.prototype.title.call(this, derivation) + " p" + this.definition.formattedPercentile();
    };
    QuantileConcreteSeries.prototype.applyExpression = function (quantileExpression, name, nestingLevel) {
        if (!(quantileExpression instanceof plywood_1.QuantileExpression))
            throw new Error("Expected QuantileExpression, got " + quantileExpression);
        var expression = new plywood_1.QuantileExpression(__assign({}, quantileExpression.valueOf(), { value: this.definition.percentile / 100 }));
        return new plywood_1.ApplyExpression({ name: name, expression: expression });
    };
    return QuantileConcreteSeries;
}(concrete_series_1.ConcreteSeries));
exports.QuantileConcreteSeries = QuantileConcreteSeries;
//# sourceMappingURL=quantile-concrete-series.js.map