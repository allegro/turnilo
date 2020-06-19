import { BaseImmutable, Property } from "immutable-class";
import { TimeTag, TimeTagJS } from "../time-tag/time-tag";
export interface TimekeeperValue {
    timeTags: TimeTag[];
    nowOverride?: Date;
}
export interface TimekeeperJS {
    timeTags: TimeTagJS[];
    nowOverride?: Date | string;
}
export declare class Timekeeper extends BaseImmutable<TimekeeperValue, TimekeeperJS> {
    static EMPTY: Timekeeper;
    static isTimekeeper(candidate: any): candidate is Timekeeper;
    static globalNow(): Date;
    static fromJS(parameters: TimekeeperJS): Timekeeper;
    static PROPERTIES: Property[];
    timeTags: TimeTag[];
    nowOverride: Date;
    constructor(parameters: TimekeeperValue);
    now(): Date;
    getTime(name: string): Date;
    updateTime(name: string, time: Date): Timekeeper;
    addTimeTagFor(name: string): Timekeeper;
    removeTimeTagFor(name: string): Timekeeper;
}
