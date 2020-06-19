import { Timezone } from "chronoshift";
import { Locale } from "../../../common/utils/time/time";
export declare function calendarDays(startDay: Date, timezone: Timezone, locale: Locale): Date[][];
export declare function monthToWeeks(startDay: Date, timezone: Timezone, locale: Locale): Date[][];
export declare function previousNDates(start: Date, n: number, timezone: Timezone): Date[];
export declare function nextNDates(start: Date, n: number, timezone: Timezone): Date[];
