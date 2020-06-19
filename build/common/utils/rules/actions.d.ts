import { Action } from "./rules-evaluator-builder";
import { VisualizationDependentAction } from "./visualization-dependent-evaluator";
import { VisualizationIndependentAction } from "./visualization-independent-evaluator";
export declare class Actions {
    static ready(score?: number): Action<{}>;
    static manualDimensionSelection(message: string): VisualizationDependentAction;
    static removeExcessiveSplits(visualizationName?: string): VisualizationDependentAction;
    static manualMeasuresSelection(): VisualizationIndependentAction;
}
