import { Instance } from "immutable-class";
export interface RefreshRuleValue {
    rule: string;
    time?: Date;
}
export interface RefreshRuleJS {
    rule: string;
    time?: Date | string;
}
export declare class RefreshRule implements Instance<RefreshRuleValue, RefreshRuleJS> {
    static FIXED: string;
    static QUERY: string;
    static REALTIME: string;
    static isRefreshRule(candidate: any): candidate is RefreshRule;
    static query(): RefreshRule;
    static fromJS(parameters: RefreshRuleJS): RefreshRule;
    rule: string;
    time: Date;
    constructor(parameters: RefreshRuleValue);
    valueOf(): RefreshRuleValue;
    toJS(): RefreshRuleJS;
    toJSON(): RefreshRuleJS;
    toString(): string;
    equals(other: RefreshRule): boolean;
    isFixed(): boolean;
    isQuery(): boolean;
    isRealtime(): boolean;
}
