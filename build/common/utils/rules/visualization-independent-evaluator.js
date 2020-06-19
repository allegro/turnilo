"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var actions_1 = require("./actions");
var predicates_1 = require("./predicates");
var rules_evaluator_builder_1 = require("./rules-evaluator-builder");
exports.visualizationIndependentEvaluator = rules_evaluator_builder_1.RulesEvaluatorBuilder.empty()
    .when(predicates_1.Predicates.noSelectedMeasures())
    .then(actions_1.Actions.manualMeasuresSelection())
    .otherwise(actions_1.Actions.ready())
    .build();
//# sourceMappingURL=visualization-independent-evaluator.js.map