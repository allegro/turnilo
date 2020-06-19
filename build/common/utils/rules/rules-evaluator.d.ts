import { Resolve } from "../../models/visualization-manifest/visualization-manifest";
export declare type RulesEvaluator<PredicateVars, ActionVars> = (variables: PredicateVars & ActionVars) => Resolve;
