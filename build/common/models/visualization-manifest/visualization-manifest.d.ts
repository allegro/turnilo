import { VisualizationDependentEvaluator } from "../../utils/rules/visualization-dependent-evaluator";
import { SeriesList } from "../series-list/series-list";
import { Splits } from "../splits/splits";
import { VisualizationSettingsConfig } from "../visualization-settings/visualization-settings";
export interface Adjustment {
    series?: SeriesList;
    splits?: Splits;
}
export declare const HIGH_PRIORITY_ACTION = 4;
export declare const NORMAL_PRIORITY_ACTION = 3;
export declare const LOWEST_PRIORITY_ACTION = 0;
export interface Resolution {
    description: string;
    adjustment: Adjustment;
}
export declare class Resolve {
    static NEVER: Resolve;
    static compare(r1: Resolve, r2: Resolve): number;
    static automatic(score: number, adjustment: Adjustment): Resolve;
    static manual(score: number, message: string, resolutions: Resolution[]): Resolve;
    static ready(score: number): Resolve;
    score: number;
    state: string;
    adjustment: Adjustment;
    message: string;
    resolutions: Resolution[];
    constructor(score: number, state: string, adjustment: Adjustment, message: string, resolutions: Resolution[]);
    toString(): string;
    valueOf(): string;
    isReady(): boolean;
    isAutomatic(): boolean;
    isManual(): boolean;
}
export declare type Visualization = "heatmap" | "table" | "totals" | "bar-chart" | "line-chart";
export declare class VisualizationManifest<T extends object = {}> {
    readonly name: Visualization;
    readonly title: string;
    readonly evaluateRules: VisualizationDependentEvaluator;
    readonly visualizationSettings: VisualizationSettingsConfig<T>;
    constructor(name: Visualization, title: string, evaluateRules: VisualizationDependentEvaluator, visualizationSettings: VisualizationSettingsConfig<T>);
}
