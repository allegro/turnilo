import { List, OrderedSet } from "immutable";
import { Expression } from "plywood";
import { Measure } from "./measure";
import { MeasureOrGroupJS, MeasureOrGroupVisitor } from "./measure-group";
export declare class Measures {
    static empty(): Measures;
    static fromJS(parameters: MeasureOrGroupJS[]): Measures;
    static fromMeasures(measures: Measure[]): Measures;
    private readonly measures;
    private readonly flattenedMeasures;
    private constructor();
    accept<R>(visitor: MeasureOrGroupVisitor<R>): R[];
    size(): int;
    first(): Measure;
    equals(other: Measures): boolean;
    mapMeasures<R>(mapper: (measure: Measure) => R): R[];
    filterMeasures(predicate: (measure: Measure) => boolean): Measure[];
    getMeasuresByNames(names: string[]): Measure[];
    forEachMeasure(sideEffect: (measure: Measure) => void): void;
    getMeasureByName(measureName: string): Measure;
    hasMeasureByName(measureName: string): boolean;
    getMeasureByExpression(expression: Expression): Measure;
    getMeasureNames(): List<string>;
    containsMeasureWithName(name: string): boolean;
    getFirstNMeasureNames(n: number): OrderedSet<string>;
    append(...measures: Measure[]): Measures;
    prepend(...measures: Measure[]): Measures;
    toJS(): MeasureOrGroupJS[];
}
