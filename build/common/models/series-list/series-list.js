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
var general_1 = require("../../utils/general/general");
var concreteArithmeticOperation_1 = require("../expression/concreteArithmeticOperation");
var expression_series_1 = require("../series/expression-series");
var measure_series_1 = require("../series/measure-series");
var series_1 = require("../series/series");
var defaultSeriesList = { series: immutable_1.List([]) };
var SeriesList = (function (_super) {
    __extends(SeriesList, _super);
    function SeriesList() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SeriesList.fromMeasureNames = function (names) {
        return new SeriesList({ series: immutable_1.List(names.map(function (reference) { return new measure_series_1.MeasureSeries({ reference: reference }); })) });
    };
    SeriesList.fromMeasures = function (measures) {
        var series = immutable_1.List(measures.map(series_1.fromMeasure));
        return new SeriesList({ series: series });
    };
    SeriesList.fromJS = function (seriesDefs, measures) {
        var series = immutable_1.List(seriesDefs.map(function (def) {
            var measure = measures.getMeasureByName(def.reference);
            return series_1.fromJS(def, measure);
        }));
        return new SeriesList({ series: series });
    };
    SeriesList.fromSeries = function (series) {
        return new SeriesList({ series: immutable_1.List(series) });
    };
    SeriesList.validSeries = function (series, measures) {
        if (series instanceof expression_series_1.ExpressionSeries && series.expression instanceof concreteArithmeticOperation_1.ArithmeticExpression) {
            return measures.hasMeasureByName(series.reference) && measures.hasMeasureByName(series.expression.reference);
        }
        return measures.hasMeasureByName(series.reference);
    };
    SeriesList.prototype.addSeries = function (newSeries) {
        var series = this.series;
        return this.insertByIndex(series.count(), newSeries);
    };
    SeriesList.prototype.removeSeries = function (series) {
        return this.updateSeries(function (list) { return list.filter(function (s) { return s.key() !== series.key(); }); });
    };
    SeriesList.prototype.replaceSeries = function (original, newSeries) {
        return this.updateSeries(function (series) {
            var idx = series.findIndex(function (s) { return s.equals(original); });
            if (idx === -1)
                throw new Error("Couldn't replace series because couldn't find original: " + original);
            return series.set(idx, newSeries);
        });
    };
    SeriesList.prototype.replaceByIndex = function (index, replace) {
        var series = this.series;
        if (series.count() === index) {
            return this.insertByIndex(index, replace);
        }
        return this.updateSeries(function (series) {
            var newSeriesIndex = series.findIndex(function (split) { return split.equals(replace); });
            if (newSeriesIndex === -1)
                return series.set(index, replace);
            var oldSplit = series.get(index);
            return series
                .set(index, replace)
                .set(newSeriesIndex, oldSplit);
        });
    };
    SeriesList.prototype.insertByIndex = function (index, insert) {
        return this.updateSeries(function (list) {
            return list
                .insert(index, insert)
                .filterNot(function (series, idx) { return series.equals(insert) && idx !== index; });
        });
    };
    SeriesList.prototype.hasMeasureSeries = function (reference) {
        var series = this.getSeries(reference);
        return series && series instanceof measure_series_1.MeasureSeries;
    };
    SeriesList.prototype.hasMeasure = function (_a) {
        var name = _a.name;
        return this.hasMeasureSeries(name);
    };
    SeriesList.prototype.getSeries = function (reference) {
        return this.series.find(function (series) { return series.reference === reference; });
    };
    SeriesList.prototype.constrainToMeasures = function (measures) {
        return this.updateSeries(function (list) { return list.filter(function (series) { return SeriesList.validSeries(series, measures); }); });
    };
    SeriesList.prototype.count = function () {
        return this.series.count();
    };
    SeriesList.prototype.isEmpty = function () {
        return this.series.isEmpty();
    };
    SeriesList.prototype.updateSeries = function (updater) {
        return this.update("series", updater);
    };
    SeriesList.prototype.hasSeries = function (series) {
        return this.series.find(function (s) { return s.equals(series); }) !== undefined;
    };
    SeriesList.prototype.hasSeriesWithKey = function (key) {
        return general_1.isTruthy(this.getSeriesWithKey(key));
    };
    SeriesList.prototype.getSeriesWithKey = function (key) {
        return this.series.find(function (series) { return series.key() === key; });
    };
    SeriesList.prototype.takeFirst = function () {
        return this.updateSeries(function (series) { return series.take(1); });
    };
    SeriesList.prototype.getExpressionSeriesFor = function (reference) {
        return this.series.filter(function (series) {
            return series.reference === reference && series instanceof expression_series_1.ExpressionSeries;
        });
    };
    return SeriesList;
}(immutable_1.Record(defaultSeriesList)));
exports.SeriesList = SeriesList;
exports.EMPTY_SERIES = new SeriesList({ series: immutable_1.List([]) });
//# sourceMappingURL=series-list.js.map