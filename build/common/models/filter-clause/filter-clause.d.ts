import { Duration, Timezone } from "chronoshift";
import { List, Record, Set as ImmutableSet } from "immutable";
import { Expression } from "plywood";
import { DateRange } from "../date-range/date-range";
import { Dimension } from "../dimension/dimension";
declare type OmitType<T extends FilterDefinition> = Partial<Pick<T, Exclude<keyof T, "type">>>;
export declare enum FilterTypes {
    BOOLEAN = "boolean",
    NUMBER = "number",
    STRING = "string",
    FIXED_TIME = "fixed_time",
    RELATIVE_TIME = "relative_time"
}
export interface FilterDefinition {
    reference: string;
    type: FilterTypes;
}
interface BooleanFilterDefinition extends FilterDefinition {
    not: boolean;
    values: ImmutableSet<string | boolean>;
}
declare const BooleanFilterClause_base: Record.Factory<BooleanFilterDefinition>;
export declare class BooleanFilterClause extends BooleanFilterClause_base {
    constructor(params: OmitType<BooleanFilterDefinition>);
}
interface NumberRangeDefinition {
    start: number;
    end: number;
    bounds?: string;
}
declare const NumberRange_base: Record.Factory<NumberRangeDefinition>;
export declare class NumberRange extends NumberRange_base {
}
interface NumberFilterDefinition extends FilterDefinition {
    not: boolean;
    values: List<NumberRange>;
}
declare const NumberFilterClause_base: Record.Factory<NumberFilterDefinition>;
export declare class NumberFilterClause extends NumberFilterClause_base {
    constructor(params: OmitType<NumberFilterDefinition>);
}
export declare enum StringFilterAction {
    IN = "in",
    MATCH = "match",
    CONTAINS = "contains"
}
interface StringFilterDefinition extends FilterDefinition {
    not: boolean;
    action: StringFilterAction;
    values: ImmutableSet<string>;
}
declare const StringFilterClause_base: Record.Factory<StringFilterDefinition>;
export declare class StringFilterClause extends StringFilterClause_base {
    constructor(params: OmitType<StringFilterDefinition>);
}
interface FixedTimeFilterDefinition extends FilterDefinition {
    values?: List<DateRange>;
}
declare const FixedTimeFilterClause_base: Record.Factory<FixedTimeFilterDefinition>;
export declare class FixedTimeFilterClause extends FixedTimeFilterClause_base {
    constructor(params: OmitType<FixedTimeFilterDefinition>);
}
export declare enum TimeFilterPeriod {
    PREVIOUS = "previous",
    LATEST = "latest",
    CURRENT = "current"
}
interface RelativeTimeFilterDefinition extends FilterDefinition {
    period: TimeFilterPeriod;
    duration: Duration;
}
declare const RelativeTimeFilterClause_base: Record.Factory<RelativeTimeFilterDefinition>;
export declare class RelativeTimeFilterClause extends RelativeTimeFilterClause_base {
    constructor(params: OmitType<RelativeTimeFilterDefinition>);
    evaluate(now: Date, maxTime: Date, timezone: Timezone): FixedTimeFilterClause;
    equals(other: any): boolean;
}
export declare type TimeFilterClause = FixedTimeFilterClause | RelativeTimeFilterClause;
export declare function isTimeFilter(clause: FilterClause): clause is TimeFilterClause;
export declare type FilterClause = BooleanFilterClause | NumberFilterClause | StringFilterClause | FixedTimeFilterClause | RelativeTimeFilterClause;
export declare function toExpression(clause: FilterClause, { expression }: Dimension): Expression;
export declare function fromJS(parameters: FilterDefinition): FilterClause;
export {};
