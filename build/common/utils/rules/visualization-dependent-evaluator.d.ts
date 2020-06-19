import { DataCube } from "../../models/data-cube/data-cube";
import { SeriesList } from "../../models/series-list/series-list";
import { Splits } from "../../models/splits/splits";
import { RulesEvaluator } from "./rules-evaluator";
import { Action, Predicate, RulesEvaluatorBuilderEmpty } from "./rules-evaluator-builder";
export interface PredicateVariables {
    dataCube?: DataCube;
    splits: Splits;
    series: SeriesList;
}
export interface ActionVariables {
    dataCube?: DataCube;
    splits?: Splits;
    series: SeriesList;
    isSelectedVisualization?: boolean;
}
export declare type VisualizationDependentPredicate = Predicate<PredicateVariables>;
export declare type VisualizationDependentAction = Action<ActionVariables>;
export declare type VisualizationDependentEvaluator = RulesEvaluator<PredicateVariables, ActionVariables>;
export declare const visualizationDependentEvaluatorBuilder: RulesEvaluatorBuilderEmpty<PredicateVariables, ActionVariables>;
