"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sort_1 = require("../../models/sort/sort");
var split_1 = require("../../models/split/split");
var splits_1 = require("../../models/splits/splits");
var visualization_manifest_1 = require("../../models/visualization-manifest/visualization-manifest");
var empty_settings_config_1 = require("../../models/visualization-settings/empty-settings-config");
var actions_1 = require("../../utils/rules/actions");
var predicates_1 = require("../../utils/rules/predicates");
var visualization_dependent_evaluator_1 = require("../../utils/rules/visualization-dependent-evaluator");
var rulesEvaluator = visualization_dependent_evaluator_1.visualizationDependentEvaluatorBuilder
    .when(predicates_1.Predicates.noSplits())
    .then(actions_1.Actions.manualDimensionSelection("The Bar Chart requires at least one split"))
    .when(predicates_1.Predicates.areExactSplitKinds("*"))
    .or(predicates_1.Predicates.areExactSplitKinds("*", "*"))
    .then(function (_a) {
    var splits = _a.splits, dataCube = _a.dataCube, isSelectedVisualization = _a.isSelectedVisualization;
    var continuousBoost = 0;
    var autoChanged = false;
    var newSplits = splits.update("splits", function (splits) { return splits.map(function (split) {
        var splitDimension = dataCube.getDimension(split.reference);
        if (splitDimension.canBucketByDefault() && split.sort.reference !== splitDimension.name) {
            split = split.changeSort(new sort_1.DimensionSort({
                reference: splitDimension.name,
                direction: split.sort.direction
            }));
            autoChanged = true;
        }
        if (splitDimension.kind === "number") {
            continuousBoost = 4;
        }
        if (!split.limit && (autoChanged || splitDimension.kind !== "time")) {
            split = split.changeLimit(25);
            autoChanged = true;
        }
        return split;
    }); });
    if (autoChanged) {
        return visualization_manifest_1.Resolve.automatic(5 + continuousBoost, { splits: newSplits });
    }
    return visualization_manifest_1.Resolve.ready(isSelectedVisualization ? 10 : (7 + continuousBoost));
})
    .otherwise(function (_a) {
    var dataCube = _a.dataCube;
    var categoricalDimensions = dataCube.dimensions.filterDimensions(function (dimension) { return dimension.kind !== "time"; });
    return visualization_manifest_1.Resolve.manual(visualization_manifest_1.NORMAL_PRIORITY_ACTION, "The Bar Chart needs one or two splits", categoricalDimensions.slice(0, 2).map(function (dimension) {
        return {
            description: "Split on " + dimension.title + " instead",
            adjustment: {
                splits: splits_1.Splits.fromSplit(split_1.Split.fromDimension(dimension))
            }
        };
    }));
})
    .build();
exports.BAR_CHART_MANIFEST = new visualization_manifest_1.VisualizationManifest("bar-chart", "Bar Chart", rulesEvaluator, empty_settings_config_1.emptySettingsConfig);
//# sourceMappingURL=bar-chart.js.map