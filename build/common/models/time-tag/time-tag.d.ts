import { BaseImmutable, Property } from "immutable-class";
export declare type Special = "static" | "realtime";
export interface TimeTagValue {
    name: string;
    time?: Date;
    updated?: Date;
    spacial?: Special;
}
export interface TimeTagJS {
    name: string;
    time?: Date | string;
    updated?: Date | string;
    spacial?: Special;
}
export declare class TimeTag extends BaseImmutable<TimeTagValue, TimeTagJS> {
    static isTimeTag(candidate: any): candidate is TimeTag;
    static PROPERTIES: Property[];
    static fromJS(parameters: TimeTagJS): TimeTag;
    name: string;
    time: Date;
    updated: Date;
    special: Special;
    constructor(parameters: TimeTagValue);
    changeTime(time: Date, now: Date): TimeTag;
}
