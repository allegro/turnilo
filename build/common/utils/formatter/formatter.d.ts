import { Timezone } from "chronoshift";
import { NumberRange } from "plywood";
import { Dimension } from "../../models/dimension/dimension";
import { FilterClause } from "../../models/filter-clause/filter-clause";
export declare function formatNumberRange(value: NumberRange): string;
export declare function formatValue(value: any, timezone?: Timezone): string;
export declare function formatSegment(value: any, timezone: Timezone): string;
export declare function formatFilterClause(dimension: Dimension, clause: FilterClause, timezone: Timezone): string;
export declare function getFormattedClause(dimension: Dimension, clause: FilterClause, timezone: Timezone): {
    title: string;
    values: string;
};
