import { DimensionKind } from "../../models/dimension/dimension";
import { VisualizationDependentPredicate } from "./visualization-dependent-evaluator";
import { VisualizationIndependentPredicate } from "./visualization-independent-evaluator";
export declare class Predicates {
    static noSplits(): VisualizationDependentPredicate;
    static numberOfSplitsIsNot(expected: number): VisualizationDependentPredicate;
    static numberOfSeriesIsNot(expected: number): VisualizationDependentPredicate;
    static areExactSplitKinds(...selectors: string[]): VisualizationDependentPredicate;
    static strictCompare(selectors: string[], kinds: string[]): boolean;
    private static testKind;
    static haveAtLeastSplitKinds(...kinds: DimensionKind[]): VisualizationDependentPredicate;
    static supportedSplitsCount(): VisualizationDependentPredicate;
    static noSelectedMeasures(): VisualizationIndependentPredicate;
}
