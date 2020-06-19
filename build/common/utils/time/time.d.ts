import { Timezone } from "chronoshift";
import * as d3 from "d3";
import { Moment } from "moment-timezone";
import { Unary } from "../functional/functional";
export declare function getMoment(date: Date, timezone: Timezone): Moment;
export interface Locale {
    shortDays: string[];
    shortMonths: string[];
    weekStart: number;
}
export declare function scaleTicksFormat(scale: d3.time.Scale<number, number>): string;
export declare function scaleTicksFormatter(scale: d3.time.Scale<number, number>): Unary<Moment, string>;
export declare function formatDatesInTimeRange({ start, end }: {
    start: Date;
    end: Date;
}, timezone: Timezone): [string, string?];
export declare function formatStartOfTimeRange(range: {
    start: Date;
    end: Date;
}, timezone: Timezone): string;
export declare function formatTimeRange(range: {
    start: Date;
    end: Date;
}, timezone: Timezone): string;
export declare function datesEqual(d1: Date, d2: Date): boolean;
export declare function getDayInMonth(date: Date, timezone: Timezone): number;
export declare function formatYearMonth(date: Date, timezone: Timezone): string;
export declare function formatTimeElapsed(date: Date, timezone: Timezone): string;
export declare function formatDateTime(date: Date, timezone: Timezone): string;
export declare function formatISODate(date: Date, timezone: Timezone): string;
export declare function formatISOTime(date: Date, timezone: Timezone): string;
export declare function normalizeISODate(date: string): string;
export declare function validateISODate(date: string): boolean;
export declare function normalizeISOTime(time: string): string;
export declare function validateISOTime(time: string): boolean;
export declare function combineDateAndTimeIntoMoment(date: string, time: string, timezone: Timezone): Moment;
