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
var concrete_series_1 = require("../series/concrete-series");
var measure_series_1 = require("../series/measure-series");
var SortType;
(function (SortType) {
    SortType["SERIES"] = "series";
    SortType["DIMENSION"] = "dimension";
})(SortType = exports.SortType || (exports.SortType = {}));
var SortDirection;
(function (SortDirection) {
    SortDirection["ascending"] = "ascending";
    SortDirection["descending"] = "descending";
})(SortDirection = exports.SortDirection || (exports.SortDirection = {}));
exports.sortDirectionMapper = {
    ascending: "ascending",
    descending: "descending"
};
var defaultSeriesSort = {
    reference: null,
    type: SortType.SERIES,
    direction: SortDirection.descending,
    period: concrete_series_1.SeriesDerivation.CURRENT
};
var SeriesSort = (function (_super) {
    __extends(SeriesSort, _super);
    function SeriesSort(params) {
        return _super.call(this, params) || this;
    }
    SeriesSort.prototype.toExpression = function () {
        var series = new measure_series_1.MeasureSeries({ reference: this.reference });
        return new plywood_1.SortExpression({
            direction: exports.sortDirectionMapper[this.direction],
            expression: plywood_1.$(series.plywoodKey(this.period))
        });
    };
    return SeriesSort;
}(immutable_1.Record(defaultSeriesSort)));
exports.SeriesSort = SeriesSort;
var defaultDimensionSort = {
    reference: null,
    type: SortType.DIMENSION,
    direction: SortDirection.descending
};
var DimensionSort = (function (_super) {
    __extends(DimensionSort, _super);
    function DimensionSort(params) {
        return _super.call(this, params) || this;
    }
    DimensionSort.prototype.toExpression = function () {
        return new plywood_1.SortExpression(({
            direction: exports.sortDirectionMapper[this.direction],
            expression: plywood_1.$(this.reference)
        }));
    };
    return DimensionSort;
}(immutable_1.Record(defaultDimensionSort)));
exports.DimensionSort = DimensionSort;
function isSortEmpty(sort) {
    return sort.reference === null;
}
exports.isSortEmpty = isSortEmpty;
//# sourceMappingURL=sort.js.map