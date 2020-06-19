import { Duration, Timezone } from "chronoshift";
import { Record } from "immutable";
interface DateRangeDefinition {
    start: Date;
    end: Date;
}
declare const DateRange_base: Record.Factory<DateRangeDefinition>;
export declare class DateRange extends DateRange_base {
    intersects(other: DateRange | null): boolean;
    shift(duration: Duration, timezone: Timezone): DateRange;
}
export {};
