"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var splits_1 = require("../../models/splits/splits");
var visualization_manifest_1 = require("../../models/visualization-manifest/visualization-manifest");
var resolutions_1 = require("./resolutions");
var Actions = (function () {
    function Actions() {
    }
    Actions.ready = function (score) {
        if (score === void 0) { score = 10; }
        return function () { return visualization_manifest_1.Resolve.ready(score); };
    };
    Actions.manualDimensionSelection = function (message) {
        return function (_a) {
            var dataCube = _a.dataCube;
            return visualization_manifest_1.Resolve.manual(visualization_manifest_1.HIGH_PRIORITY_ACTION, message, resolutions_1.Resolutions.someDimensions(dataCube));
        };
    };
    Actions.removeExcessiveSplits = function (visualizationName) {
        if (visualizationName === void 0) { visualizationName = "Visualization"; }
        return function (_a) {
            var splits = _a.splits, dataCube = _a.dataCube;
            var newSplits = splits.splits.take(dataCube.getMaxSplits());
            var excessiveSplits = splits.splits
                .skip(dataCube.getMaxSplits())
                .map(function (split) { return dataCube.getDimension(split.reference).title; });
            return visualization_manifest_1.Resolve.manual(visualization_manifest_1.NORMAL_PRIORITY_ACTION, visualizationName + " supports only " + dataCube.getMaxSplits() + " splits", [
                {
                    description: "Remove excessive splits: " + excessiveSplits.toArray().join(", "),
                    adjustment: {
                        splits: splits_1.Splits.fromSplits(newSplits.toArray())
                    }
                }
            ]);
        };
    };
    Actions.manualMeasuresSelection = function () {
        return function (_a) {
            var dataCube = _a.dataCube;
            var selectDefault = resolutions_1.Resolutions.defaultSelectedMeasures(dataCube);
            var resolutions = selectDefault.length > 0 ? selectDefault : resolutions_1.Resolutions.firstMeasure(dataCube);
            return visualization_manifest_1.Resolve.manual(visualization_manifest_1.NORMAL_PRIORITY_ACTION, "At least one of the measures should be selected", resolutions);
        };
    };
    return Actions;
}());
exports.Actions = Actions;
//# sourceMappingURL=actions.js.map