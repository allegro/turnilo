import { Resolve } from "../../models/visualization-manifest/visualization-manifest";
import { RulesEvaluator } from "./rules-evaluator";
export declare type Predicate<Variables> = (predicateVariables: Variables) => boolean;
export declare type Action<Variables> = (actionVariables: Variables) => Resolve;
export interface RulesEvaluatorBuilderEmpty<PredicateVars, ActionVars> {
    when(predicate: Predicate<PredicateVars>): RulesEvaluatorBuilderWithPartialRule<PredicateVars, ActionVars>;
}
export interface RulesEvaluatorBuilderWithRule<PredicateVars, ActionVars> extends RulesEvaluatorBuilderEmpty<PredicateVars, ActionVars> {
    otherwise(action: Action<ActionVars>): RulesEvaluatorBuilderComplete<PredicateVars, ActionVars>;
}
export interface RulesEvaluatorBuilderWithPartialRule<PredicateVars, ActionVars> {
    or(predicate: Predicate<PredicateVars>): RulesEvaluatorBuilderWithPartialRule<PredicateVars, ActionVars>;
    then(action: Action<ActionVars>): RulesEvaluatorBuilderWithRule<PredicateVars, ActionVars>;
}
export interface RulesEvaluatorBuilderComplete<PredicateVars, ActionVars> {
    build(): RulesEvaluator<PredicateVars, ActionVars>;
}
export declare class RulesEvaluatorBuilder<PredicateVars, ActionVars> implements RulesEvaluatorBuilderWithRule<PredicateVars, ActionVars>, RulesEvaluatorBuilderWithPartialRule<PredicateVars, ActionVars>, RulesEvaluatorBuilderComplete<PredicateVars, ActionVars> {
    static empty<PredicateVars, ActionVars>(): RulesEvaluatorBuilderEmpty<PredicateVars, ActionVars>;
    private readonly rules;
    private readonly partialRule?;
    private readonly otherwiseAction;
    private constructor();
    when(predicate: Predicate<PredicateVars>): RulesEvaluatorBuilderWithPartialRule<PredicateVars, ActionVars>;
    or(predicate: Predicate<PredicateVars>): RulesEvaluatorBuilderWithPartialRule<PredicateVars, ActionVars>;
    then(action: Action<ActionVars>): RulesEvaluatorBuilderWithRule<PredicateVars, ActionVars>;
    otherwise(action: Action<ActionVars>): RulesEvaluatorBuilderComplete<PredicateVars, ActionVars>;
    build(): RulesEvaluator<PredicateVars, ActionVars>;
}
