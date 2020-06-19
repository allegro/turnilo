"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var visualization_manifest_1 = require("../../models/visualization-manifest/visualization-manifest");
var actions_1 = require("../../utils/rules/actions");
var predicates_1 = require("../../utils/rules/predicates");
var visualization_dependent_evaluator_1 = require("../../utils/rules/visualization-dependent-evaluator");
var settings_1 = require("./settings");
var rulesEvaluator = visualization_dependent_evaluator_1.visualizationDependentEvaluatorBuilder
    .when(predicates_1.Predicates.noSplits())
    .then(actions_1.Actions.manualDimensionSelection("The Table requires at least one split"))
    .when(predicates_1.Predicates.supportedSplitsCount())
    .then(actions_1.Actions.removeExcessiveSplits("Table"))
    .otherwise(function (_a) {
    var splits = _a.splits, dataCube = _a.dataCube, isSelectedVisualization = _a.isSelectedVisualization;
    var autoChanged = false;
    var newSplits = splits.update("splits", function (splits) { return splits.map(function (split, i) {
        var splitDimension = dataCube.getDimension(split.reference);
        if (!split.limit && splitDimension.kind !== "time") {
            split = split.changeLimit(i ? 5 : 50);
            autoChanged = true;
        }
        return split;
    }); });
    return autoChanged ? visualization_manifest_1.Resolve.automatic(6, { splits: newSplits }) : visualization_manifest_1.Resolve.ready(isSelectedVisualization ? 10 : 6);
})
    .build();
exports.TABLE_MANIFEST = new visualization_manifest_1.VisualizationManifest("table", "Table", rulesEvaluator, settings_1.settings);
//# sourceMappingURL=table.js.map