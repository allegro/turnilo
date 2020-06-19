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
var concrete_series_1 = require("../series/concrete-series");
var sort_1 = require("../sort/sort");
var SortOn = (function () {
    function SortOn(key, title, period) {
        this.key = key;
        this.title = title;
        this.period = period;
    }
    SortOn.fromSort = function (sort, essence) {
        var type = sort.type, reference = sort.reference;
        switch (type) {
            case sort_1.SortType.DIMENSION:
                var dimension = essence.dataCube.getDimension(reference);
                return new DimensionSortOn(dimension);
            case sort_1.SortType.SERIES:
                var period = sort.period;
                var series = essence.findConcreteSeries(reference);
                return new SeriesSortOn(series, period);
        }
    };
    SortOn.getKey = function (sortOn) {
        return sortOn.key;
    };
    SortOn.getTitle = function (sortOn) {
        return sortOn.title;
    };
    SortOn.equals = function (sortOn, other) {
        if (!sortOn)
            return sortOn === other;
        return sortOn.equals(other);
    };
    return SortOn;
}());
exports.SortOn = SortOn;
var DimensionSortOn = (function (_super) {
    __extends(DimensionSortOn, _super);
    function DimensionSortOn(dimension) {
        return _super.call(this, dimension.name, dimension.title) || this;
    }
    DimensionSortOn.prototype.equals = function (other) {
        return other instanceof DimensionSortOn
            && this.key === other.key
            && this.title === other.title;
    };
    DimensionSortOn.prototype.toSort = function (direction) {
        return new sort_1.DimensionSort({ direction: direction, reference: this.key });
    };
    return DimensionSortOn;
}(SortOn));
exports.DimensionSortOn = DimensionSortOn;
var SeriesSortOn = (function (_super) {
    __extends(SeriesSortOn, _super);
    function SeriesSortOn(series, period) {
        if (period === void 0) { period = concrete_series_1.SeriesDerivation.CURRENT; }
        return _super.call(this, series.definition.key(), series.title(period), period) || this;
    }
    SeriesSortOn.prototype.equals = function (other) {
        return other instanceof SeriesSortOn
            && this.key === other.key
            && this.title === other.title
            && this.period === other.period;
    };
    SeriesSortOn.prototype.toSort = function (direction) {
        return new sort_1.SeriesSort({ reference: this.key, direction: direction, period: this.period });
    };
    return SeriesSortOn;
}(SortOn));
exports.SeriesSortOn = SeriesSortOn;
//# sourceMappingURL=sort-on.js.map