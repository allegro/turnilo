"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var series_list_1 = require("../../models/series-list/series-list");
var measure_series_1 = require("../../models/series/measure-series");
var split_1 = require("../../models/split/split");
var splits_1 = require("../../models/splits/splits");
var Resolutions = (function () {
    function Resolutions() {
    }
    Resolutions.someDimensions = function (dataCube) {
        var numberOfSuggestedSplitDimensions = 2;
        var suggestedSplitDimensions = dataCube
            .getDimensionsByKind("string")
            .slice(0, numberOfSuggestedSplitDimensions);
        return suggestedSplitDimensions.map(function (dimension) {
            return {
                description: "Add a split on " + dimension.title,
                adjustment: {
                    splits: splits_1.Splits.fromSplit(split_1.Split.fromDimension(dimension))
                }
            };
        });
    };
    Resolutions.defaultSelectedMeasures = function (dataCube) {
        var defaultSelectedMeasures = dataCube.defaultSelectedMeasures || immutable_1.OrderedSet();
        var measures = defaultSelectedMeasures.map(function (measureName) { return dataCube.getMeasure(measureName); }).toArray();
        if (measures.length === 0) {
            return [];
        }
        var measureTitles = measures.map(function (measure) { return measure.title; });
        return [
            {
                description: "Select default measures: " + measureTitles.join(", "),
                adjustment: {
                    series: new series_list_1.SeriesList({ series: immutable_1.List(measures.map(function (measure) { return measure_series_1.MeasureSeries.fromMeasure(measure); })) })
                }
            }
        ];
    };
    Resolutions.firstMeasure = function (dataCube) {
        var firstMeasure = dataCube.measures.first();
        if (!firstMeasure)
            return [];
        return [
            {
                description: "Select measure: " + firstMeasure.title,
                adjustment: {
                    series: new series_list_1.SeriesList({ series: immutable_1.List.of(measure_series_1.MeasureSeries.fromMeasure(firstMeasure)) })
                }
            }
        ];
    };
    return Resolutions;
}());
exports.Resolutions = Resolutions;
//# sourceMappingURL=resolutions.js.map