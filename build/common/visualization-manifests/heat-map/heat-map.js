"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var measure_series_1 = require("../../models/series/measure-series");
var sort_1 = require("../../models/sort/sort");
var split_1 = require("../../models/split/split");
var visualization_manifest_1 = require("../../models/visualization-manifest/visualization-manifest");
var empty_settings_config_1 = require("../../models/visualization-settings/empty-settings-config");
var predicates_1 = require("../../utils/rules/predicates");
var visualization_dependent_evaluator_1 = require("../../utils/rules/visualization-dependent-evaluator");
var rulesEvaluator = visualization_dependent_evaluator_1.visualizationDependentEvaluatorBuilder
    .when(predicates_1.Predicates.numberOfSplitsIsNot(2))
    .then(function (variables) { return visualization_manifest_1.Resolve.manual(3, "Heatmap needs exactly 2 splits", variables.splits.length() > 2 ? suggestRemovingSplits(variables) : suggestAddingSplits(variables)); })
    .when(predicates_1.Predicates.numberOfSeriesIsNot(1))
    .then(function (variables) { return visualization_manifest_1.Resolve.manual(3, "Heatmap needs exactly 1 measure", variables.series.series.size === 0 ? suggestAddingMeasure(variables) : suggestRemovingMeasures(variables)); })
    .otherwise(function (_a) {
    var splits = _a.splits, dataCube = _a.dataCube, series = _a.series;
    var autoChanged = false;
    var newSplits = splits.update("splits", function (splits) { return splits.map(function (split, i) {
        var splitDimension = dataCube.getDimension(split.reference);
        var sortStrategy = splitDimension.sortStrategy;
        if (sort_1.isSortEmpty(split.sort)) {
            if (sortStrategy) {
                if (sortStrategy === "self" || split.reference === sortStrategy) {
                    split = split.changeSort(new sort_1.DimensionSort({
                        reference: splitDimension.name,
                        direction: sort_1.SortDirection.descending
                    }));
                }
                else {
                    split = split.changeSort(new sort_1.SeriesSort({
                        reference: sortStrategy,
                        direction: sort_1.SortDirection.descending
                    }));
                }
            }
            else {
                if (split.type === split_1.SplitType.string) {
                    split = split.changeSort(new sort_1.SeriesSort({
                        reference: series.series.first().reference,
                        direction: sort_1.SortDirection.descending
                    }));
                }
                else {
                    split = split.changeSort(new sort_1.DimensionSort({
                        reference: splitDimension.name,
                        direction: sort_1.SortDirection.descending
                    }));
                }
                autoChanged = true;
            }
        }
        if (!split.limit && splitDimension.kind !== "time") {
            split = split.changeLimit(25);
            autoChanged = true;
        }
        return split;
    }); });
    return autoChanged ? visualization_manifest_1.Resolve.automatic(10, { splits: newSplits }) : visualization_manifest_1.Resolve.ready(10);
})
    .build();
var suggestRemovingSplits = function (_a) {
    var splits = _a.splits;
    return [{
            description: splits.length() === 3 ? "Remove last split" : "Remove last " + (splits.length() - 2) + " splits",
            adjustment: { splits: splits.slice(0, 2) }
        }];
};
var suggestAddingSplits = function (_a) {
    var dataCube = _a.dataCube, splits = _a.splits;
    return dataCube.dimensions
        .filterDimensions(function (dimension) { return !splits.hasSplitOn(dimension); })
        .slice(0, 2)
        .map(function (dimension) { return ({
        description: "Add " + dimension.title + " split",
        adjustment: {
            splits: splits.addSplit(split_1.Split.fromDimension(dimension))
        }
    }); });
};
var suggestAddingMeasure = function (_a) {
    var dataCube = _a.dataCube, series = _a.series;
    return [{
            description: "Add measure " + dataCube.measures.first().title,
            adjustment: {
                series: series.addSeries(measure_series_1.MeasureSeries.fromMeasure(dataCube.measures.first()))
            }
        }];
};
var suggestRemovingMeasures = function (_a) {
    var series = _a.series;
    return [{
            description: series.count() === 2 ? "Remove last measure" : "Remove last " + (series.count() - 1) + " measures",
            adjustment: {
                series: series.takeFirst()
            }
        }];
};
exports.HEAT_MAP_MANIFEST = new visualization_manifest_1.VisualizationManifest("heatmap", "Heatmap", rulesEvaluator, empty_settings_config_1.emptySettingsConfig);
//# sourceMappingURL=heat-map.js.map