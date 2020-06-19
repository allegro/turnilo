import { DataCube } from "../../models/data-cube/data-cube";
import { SeriesList } from "../../models/series-list/series-list";
import { RulesEvaluator } from "./rules-evaluator";
import { Action, Predicate } from "./rules-evaluator-builder";
export interface PredicateVariables {
    series: SeriesList;
}
export interface ActionVariables {
    dataCube: DataCube;
}
export declare type VisualizationIndependentPredicate = Predicate<PredicateVariables>;
export declare type VisualizationIndependentAction = Action<ActionVariables>;
export declare type VisualizationIndependentEvaluator = RulesEvaluator<PredicateVariables, ActionVariables>;
export declare const visualizationIndependentEvaluator: VisualizationIndependentEvaluator;
