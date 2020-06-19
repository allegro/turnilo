import { Dimension } from "../../../common/models/dimension/dimension";
import { FilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Measure } from "../../../common/models/measure/measure";
import { Series } from "../../../common/models/series/series";
import { Split } from "../../../common/models/split/split";
declare enum DraggedElementType {
    NONE = 0,
    DIMENSION = 1,
    MEASURE = 2,
    SERIES = 3,
    SPLIT = 4,
    FILTER = 5
}
interface DraggedElementBase<T> {
    type: DraggedElementType;
    element: T;
}
interface DraggedDimension extends DraggedElementBase<Dimension> {
    type: DraggedElementType.DIMENSION;
}
interface DraggedMeasure extends DraggedElementBase<Measure> {
    type: DraggedElementType.MEASURE;
}
interface DraggedSeries extends DraggedElementBase<Series> {
    type: DraggedElementType.SERIES;
}
interface DraggedSplit extends DraggedElementBase<Split> {
    type: DraggedElementType.SPLIT;
}
interface DraggedFilter extends DraggedElementBase<FilterClause> {
    type: DraggedElementType.FILTER;
}
interface None extends DraggedElementBase<void> {
    type: DraggedElementType.NONE;
}
declare type DraggedElement = DraggedDimension | DraggedMeasure | DraggedFilter | DraggedSplit | DraggedSeries | None;
export declare class DragManager {
    static dragging: DraggedElement;
    static init(): void;
    static isDraggingSplit(): boolean;
    static isDraggingFilter(): boolean;
    static isDraggingSeries(): boolean;
    static setDragDimension(element: Dimension): void;
    static setDragMeasure(element: Measure): void;
    static setDragSeries(element: Series): void;
    static setDragFilter(element: FilterClause): void;
    static setDragSplit(element: Split): void;
    static draggingDimension(): Dimension;
    static draggingMeasure(): Measure;
    static draggingSplit(): Split;
    static draggingSeries(): Series;
    static draggingFilter(): FilterClause;
}
export {};
