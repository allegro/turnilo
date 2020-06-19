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
var concrete_series_1 = require("./concrete-series");
var series_format_1 = require("./series-format");
var series_type_1 = require("./series-type");
var defaultMeasureSeries = {
    reference: null,
    format: series_format_1.DEFAULT_FORMAT,
    type: series_type_1.SeriesType.MEASURE
};
var MeasureSeries = (function (_super) {
    __extends(MeasureSeries, _super);
    function MeasureSeries(params) {
        return _super.call(this, params) || this;
    }
    MeasureSeries.fromMeasure = function (measure) {
        return new MeasureSeries({ reference: measure.name });
    };
    MeasureSeries.fromJS = function (_a) {
        var reference = _a.reference, format = _a.format, type = _a.type;
        return new MeasureSeries({ reference: reference, type: type, format: series_format_1.SeriesFormat.fromJS(format) });
    };
    MeasureSeries.prototype.key = function () {
        return this.reference;
    };
    MeasureSeries.prototype.plywoodKey = function (derivation) {
        if (derivation === void 0) { derivation = concrete_series_1.SeriesDerivation.CURRENT; }
        return concrete_series_1.getNameWithDerivation(this.reference, derivation);
    };
    return MeasureSeries;
}(immutable_1.Record(defaultMeasureSeries)));
exports.MeasureSeries = MeasureSeries;
//# sourceMappingURL=measure-series.js.map