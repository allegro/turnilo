import { Measure } from "../../../common/models/measure/measure";
import { MeasureGroup, MeasureOrGroupVisitor } from "../../../common/models/measure/measure-group";
export declare type MeasureOrGroupForView = MeasureForView | MeasureGroupForView;
export interface MeasureForView {
    name: string;
    title: string;
    approximate: boolean;
    description?: string;
    hasSelectedMeasures: boolean;
    hasSearchText: boolean;
    type: MeasureForViewType.measure;
}
export interface MeasureGroupForView {
    name: string;
    title: string;
    description?: string;
    hasSearchText: boolean;
    hasSelectedMeasures: boolean;
    children: MeasureOrGroupForView[];
    type: MeasureForViewType.group;
}
export declare enum MeasureForViewType {
    measure = "measure",
    group = "group"
}
export declare class MeasuresConverter implements MeasureOrGroupVisitor<MeasureOrGroupForView> {
    private hasSearchTextPredicate;
    private isSelectedMeasurePredicate;
    constructor(hasSearchTextPredicate: (measure: Measure) => boolean, isSelectedMeasurePredicate: (measure: Measure) => boolean);
    visitMeasure(measure: Measure): MeasureOrGroupForView;
    visitMeasureGroup(measureGroup: MeasureGroup): MeasureOrGroupForView;
}
