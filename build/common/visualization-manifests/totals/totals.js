"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var splits_1 = require("../../models/splits/splits");
var visualization_manifest_1 = require("../../models/visualization-manifest/visualization-manifest");
var empty_settings_config_1 = require("../../models/visualization-settings/empty-settings-config");
var predicates_1 = require("../../utils/rules/predicates");
var visualization_dependent_evaluator_1 = require("../../utils/rules/visualization-dependent-evaluator");
var rulesEvaluator = visualization_dependent_evaluator_1.visualizationDependentEvaluatorBuilder
    .when(predicates_1.Predicates.noSplits())
    .then(function () { return visualization_manifest_1.Resolve.ready(10); })
    .otherwise(function () { return visualization_manifest_1.Resolve.automatic(3, { splits: splits_1.EMPTY_SPLITS }); })
    .build();
exports.TOTALS_MANIFEST = new visualization_manifest_1.VisualizationManifest("totals", "Totals", rulesEvaluator, empty_settings_config_1.emptySettingsConfig);
//# sourceMappingURL=totals.js.map