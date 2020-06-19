import { List } from "immutable";
import { BaseImmutable, Property } from "immutable-class";
import { AttributeInfo, Expression } from "plywood";
import { MeasureOrGroupVisitor } from "./measure-group";
export interface MeasureValue {
    name: string;
    title?: string;
    units?: string;
    formula?: string;
    format?: string;
    transformation?: string;
    description?: string;
    lowerIsBetter?: boolean;
}
export interface MeasureJS {
    name: string;
    title?: string;
    units?: string;
    formula?: string;
    format?: string;
    transformation?: string;
    description?: string;
    lowerIsBetter?: boolean;
}
export declare class Measure extends BaseImmutable<MeasureValue, MeasureJS> {
    static DEFAULT_FORMAT: string;
    static DEFAULT_TRANSFORMATION: string;
    static TRANSFORMATIONS: string[];
    static isMeasure(candidate: any): candidate is Measure;
    static getMeasure(measures: List<Measure>, measureName: string): Measure;
    static getReferences(ex: Expression): string[];
    static hasCountDistinctReferences(ex: Expression): boolean;
    static hasQuantileReferences(ex: Expression): boolean;
    static measuresFromAttributeInfo(attribute: AttributeInfo): Measure[];
    static fromJS(parameters: MeasureJS): Measure;
    static PROPERTIES: Property[];
    name: string;
    title: string;
    description?: string;
    units: string;
    formula: string;
    expression: Expression;
    format: string;
    formatFn: (n: number) => string;
    transformation: string;
    lowerIsBetter: boolean;
    readonly type = "measure";
    constructor(parameters: MeasureValue);
    accept<R>(visitor: MeasureOrGroupVisitor<R>): R;
    equals(other: any): boolean;
    getTitleWithUnits(): string;
    isApproximate(): boolean;
    isQuantile(): boolean;
    getFormat: () => string;
}
