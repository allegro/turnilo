import { List } from "immutable";
import { Expression } from "plywood";
import { Dimension } from "./dimension";
import { DimensionOrGroupJS, DimensionOrGroupVisitor } from "./dimension-group";
export declare class Dimensions {
    static empty(): Dimensions;
    static fromJS(parameters: DimensionOrGroupJS[]): Dimensions;
    static fromDimensions(dimensions: Dimension[]): Dimensions;
    private readonly dimensions;
    private readonly flattenedDimensions;
    private constructor();
    accept<R>(visitor: DimensionOrGroupVisitor<R>): R[];
    size(): number;
    first(): Dimension;
    equals(other: Dimensions): boolean;
    mapDimensions<R>(mapper: (dimension: Dimension) => R): R[];
    filterDimensions(predicate: (dimension: Dimension) => boolean): Dimension[];
    forEachDimension(sideEffect: (dimension: Dimension) => void): void;
    getDimensionByName(name: string): Dimension;
    getDimensionByExpression(expression: Expression): Dimension;
    getDimensionNames(): List<string>;
    containsDimensionWithName(name: string): boolean;
    append(...dimensions: Dimension[]): Dimensions;
    prepend(...dimensions: Dimension[]): Dimensions;
    toJS(): DimensionOrGroupJS[];
}
