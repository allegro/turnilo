import { Dimension } from "../../../common/models/dimension/dimension";
import { DimensionGroup, DimensionOrGroupVisitor } from "../../../common/models/dimension/dimension-group";
export declare type DimensionOrGroupForView = DimensionForView | DimensionGroupForView;
export interface DimensionForView {
    name: string;
    title: string;
    description?: string;
    classSuffix: string;
    hasSearchText: boolean;
    isFilteredOrSplit: boolean;
    selected: boolean;
    type: DimensionForViewType.dimension;
}
export interface DimensionGroupForView {
    name: string;
    title: string;
    description?: string;
    hasSearchText: boolean;
    isFilteredOrSplit: boolean;
    children: DimensionOrGroupForView[];
    type: DimensionForViewType.group;
}
export declare enum DimensionForViewType {
    dimension = "dimension",
    group = "group"
}
export declare class DimensionsConverter implements DimensionOrGroupVisitor<DimensionOrGroupForView> {
    private readonly hasSearchTextPredicate;
    private readonly isFilteredOrSplitPredicate;
    private readonly isSelectedDimensionPredicate;
    constructor(hasSearchTextPredicate: (dimension: Dimension) => boolean, isFilteredOrSplitPredicate: (dimension: Dimension) => boolean, isSelectedDimensionPredicate: (dimension: Dimension) => boolean);
    visitDimension(dimension: Dimension): DimensionOrGroupForView;
    visitDimensionGroup(dimensionGroup: DimensionGroup): DimensionOrGroupForView;
}
