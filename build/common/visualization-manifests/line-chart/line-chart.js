"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var dom_1 = require("../../../client/utils/dom/dom");
var limit_1 = require("../../limit/limit");
var colors_1 = require("../../models/colors/colors");
var sort_1 = require("../../models/sort/sort");
var split_1 = require("../../models/split/split");
var splits_1 = require("../../models/splits/splits");
var visualization_manifest_1 = require("../../models/visualization-manifest/visualization-manifest");
var predicates_1 = require("../../utils/rules/predicates");
var visualization_dependent_evaluator_1 = require("../../utils/rules/visualization-dependent-evaluator");
var settings_1 = require("./settings");
var COLORS_COUNT = colors_1.NORMAL_COLORS.length;
var rulesEvaluator = visualization_dependent_evaluator_1.visualizationDependentEvaluatorBuilder
    .when(function (_a) {
    var dataCube = _a.dataCube;
    return !(dataCube.getDimensionsByKind("time").length || dataCube.getDimensionsByKind("number").length);
})
    .then(function () { return visualization_manifest_1.Resolve.NEVER; })
    .when(predicates_1.Predicates.noSplits())
    .then(function (_a) {
    var dataCube = _a.dataCube;
    var continuousDimensions = dataCube.getDimensionsByKind("time").concat(dataCube.getDimensionsByKind("number"));
    return visualization_manifest_1.Resolve.manual(visualization_manifest_1.NORMAL_PRIORITY_ACTION, "This visualization requires a continuous dimension split", continuousDimensions.map(function (continuousDimension) {
        return {
            description: "Add a split on " + continuousDimension.title,
            adjustment: {
                splits: splits_1.Splits.fromSplit(split_1.Split.fromDimension(continuousDimension))
            }
        };
    }));
})
    .when(predicates_1.Predicates.areExactSplitKinds("time"))
    .or(predicates_1.Predicates.areExactSplitKinds("number"))
    .then(function (_a) {
    var splits = _a.splits, dataCube = _a.dataCube, isSelectedVisualization = _a.isSelectedVisualization;
    var score = 4;
    var continuousSplit = splits.getSplit(0);
    var continuousDimension = dataCube.getDimension(continuousSplit.reference);
    var sortStrategy = continuousDimension.sortStrategy;
    var sort = null;
    if (sortStrategy && sortStrategy !== "self") {
        sort = new sort_1.DimensionSort({
            reference: sortStrategy,
            direction: sort_1.SortDirection.ascending
        });
    }
    else {
        sort = new sort_1.DimensionSort({
            reference: continuousDimension.name,
            direction: sort_1.SortDirection.ascending
        });
    }
    var autoChanged = false;
    if (!sort.equals(continuousSplit.sort)) {
        continuousSplit = continuousSplit.changeSort(sort);
        autoChanged = true;
    }
    if (continuousSplit.limit && continuousDimension.kind === "time") {
        continuousSplit = continuousSplit.changeLimit(null);
        autoChanged = true;
    }
    if (continuousDimension.kind === "time")
        score += 3;
    if (!autoChanged)
        return visualization_manifest_1.Resolve.ready(isSelectedVisualization ? 10 : score);
    return visualization_manifest_1.Resolve.automatic(score, { splits: new splits_1.Splits({ splits: immutable_1.List([continuousSplit]) }) });
})
    .when(predicates_1.Predicates.areExactSplitKinds("time", "*"))
    .then(function (_a) {
    var splits = _a.splits, dataCube = _a.dataCube;
    var timeSplit = splits.getSplit(0);
    var timeDimension = dataCube.getDimension(timeSplit.reference);
    var sort = new sort_1.DimensionSort({
        reference: timeDimension.name,
        direction: sort_1.SortDirection.ascending
    });
    if (!sort.equals(timeSplit.sort)) {
        timeSplit = timeSplit.changeSort(sort);
    }
    if (timeSplit.limit) {
        timeSplit = timeSplit.changeLimit(null);
    }
    var colorSplit = splits.getSplit(1).update("limit", function (limit) { return dom_1.clamp(limit, limit_1.AVAILABLE_LIMITS[0], COLORS_COUNT); });
    return visualization_manifest_1.Resolve.automatic(8, {
        splits: new splits_1.Splits({ splits: immutable_1.List([colorSplit, timeSplit]) })
    });
})
    .when(predicates_1.Predicates.areExactSplitKinds("*", "time"))
    .or(predicates_1.Predicates.areExactSplitKinds("*", "number"))
    .then(function (_a) {
    var splits = _a.splits, dataCube = _a.dataCube;
    var timeSplit = splits.getSplit(1);
    var timeDimension = dataCube.getDimension(timeSplit.reference);
    var autoChanged = false;
    var sort = new sort_1.DimensionSort({
        reference: timeDimension.name,
        direction: sort_1.SortDirection.ascending
    });
    if (!sort.equals(timeSplit.sort)) {
        timeSplit = timeSplit.changeSort(sort);
        autoChanged = true;
    }
    if (timeSplit.limit) {
        timeSplit = timeSplit.changeLimit(null);
        autoChanged = true;
    }
    var colorSplit = splits.getSplit(0).update("limit", function (limit) {
        if (limit === null || limit > COLORS_COUNT) {
            autoChanged = true;
            return COLORS_COUNT;
        }
        return limit;
    });
    if (!autoChanged)
        return visualization_manifest_1.Resolve.ready(10);
    return visualization_manifest_1.Resolve.automatic(8, {
        splits: new splits_1.Splits({ splits: immutable_1.List([colorSplit, timeSplit]) })
    });
})
    .when(predicates_1.Predicates.haveAtLeastSplitKinds("time"))
    .then(function (_a) {
    var splits = _a.splits, dataCube = _a.dataCube;
    var timeSplit = splits.splits.find(function (split) { return dataCube.getDimension(split.reference).kind === "time"; });
    return visualization_manifest_1.Resolve.manual(visualization_manifest_1.NORMAL_PRIORITY_ACTION, "Too many splits on the line chart", [
        {
            description: "Remove all but the time split",
            adjustment: {
                splits: splits_1.Splits.fromSplit(timeSplit)
            }
        }
    ]);
})
    .otherwise(function (_a) {
    var dataCube = _a.dataCube;
    var continuousDimensions = dataCube.getDimensionsByKind("time").concat(dataCube.getDimensionsByKind("number"));
    return visualization_manifest_1.Resolve.manual(visualization_manifest_1.NORMAL_PRIORITY_ACTION, "The Line Chart needs one continuous dimension split", continuousDimensions.map(function (continuousDimension) {
        return {
            description: "Split on " + continuousDimension.title + " instead",
            adjustment: {
                splits: splits_1.Splits.fromSplit(split_1.Split.fromDimension(continuousDimension))
            }
        };
    }));
})
    .build();
exports.LINE_CHART_MANIFEST = new visualization_manifest_1.VisualizationManifest("line-chart", "Line Chart", rulesEvaluator, settings_1.settings);
//# sourceMappingURL=line-chart.js.map