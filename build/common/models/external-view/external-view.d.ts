import { Timezone } from "chronoshift";
import { Instance } from "immutable-class";
import { DataCube } from "../data-cube/data-cube";
import { Filter } from "../filter/filter";
import { Splits } from "../splits/splits";
export declare type LinkGenerator = (dataCube: DataCube, timezone: Timezone, filter: Filter, splits: Splits) => string;
export interface ExternalViewValue {
    title: string;
    linkGenerator: string;
    linkGeneratorFn?: LinkGenerator;
    sameWindow?: boolean;
}
export declare class ExternalView implements Instance<ExternalViewValue, ExternalViewValue> {
    static isExternalView(candidate: any): candidate is ExternalView;
    static fromJS(parameters: ExternalViewValue): ExternalView;
    title: string;
    linkGenerator: string;
    sameWindow: boolean;
    linkGeneratorFn: LinkGenerator;
    constructor(parameters: ExternalViewValue);
    toJS(): ExternalViewValue;
    valueOf(): ExternalViewValue;
    toJSON(): ExternalViewValue;
    equals(other: ExternalView): boolean;
    toString(): string;
}
