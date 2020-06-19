import { Duration, Timezone } from "chronoshift";
import { Instance } from "immutable-class";
import { TimeFilterClause } from "../filter-clause/filter-clause";
export declare function isValidTimeShift(input: string): boolean;
export declare type TimeShiftValue = Duration;
export declare type TimeShiftJS = string;
export declare class TimeShift implements Instance<TimeShiftValue, TimeShiftJS> {
    value: Duration;
    static fromJS(timeShift: string): TimeShift;
    static empty(): TimeShift;
    static isTimeShift(candidate: any): boolean;
    constructor(value: Duration);
    equals(other: any): boolean;
    toJS(): TimeShiftJS;
    toJSON(): TimeShiftJS;
    valueOf(): TimeShiftValue;
    isEmpty(): boolean;
    getDescription(capitalize?: boolean): string;
    toString(): string;
    private isValidForTimeFilter;
    constrainToFilter(timeFilter: TimeFilterClause, timezone: Timezone): TimeShift;
}
