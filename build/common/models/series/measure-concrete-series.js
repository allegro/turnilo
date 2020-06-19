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
var plywood_1 = require("plywood");
var concrete_series_1 = require("./concrete-series");
var measure_series_1 = require("./measure-series");
function fromMeasure(measure) {
    return new MeasureConcreteSeries(measure_series_1.MeasureSeries.fromMeasure(measure), measure);
}
exports.fromMeasure = fromMeasure;
var MeasureConcreteSeries = (function (_super) {
    __extends(MeasureConcreteSeries, _super);
    function MeasureConcreteSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MeasureConcreteSeries.prototype.applyExpression = function (expression, name, nestingLevel) {
        return new plywood_1.ApplyExpression({ expression: expression, name: name });
    };
    return MeasureConcreteSeries;
}(concrete_series_1.ConcreteSeries));
exports.MeasureConcreteSeries = MeasureConcreteSeries;
//# sourceMappingURL=measure-concrete-series.js.map