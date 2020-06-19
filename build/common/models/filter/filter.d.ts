import { Timezone } from "chronoshift";
import { List, Record } from "immutable";
import { Expression } from "plywood";
import { DataCube } from "../data-cube/data-cube";
import { Dimension } from "../dimension/dimension";
import { Dimensions } from "../dimension/dimensions";
import { FilterClause, FilterDefinition } from "../filter-clause/filter-clause";
export declare enum FilterMode {
    EXCLUDE = "exclude",
    INCLUDE = "include",
    REGEX = "regex",
    CONTAINS = "contains"
}
export interface FilterValue {
    clauses: List<FilterClause>;
}
declare const Filter_base: Record.Factory<FilterValue>;
export declare class Filter extends Filter_base {
    static fromClause(clause: FilterClause): Filter;
    static fromClauses(clauses: FilterClause[]): Filter;
    static fromJS(definition: {
        clauses: FilterDefinition[];
    }): Filter;
    private updateClauses;
    toString(): string;
    replaceByIndex(index: number, newClause: FilterClause): Filter;
    insertByIndex(index: number, newClause: FilterClause): Filter;
    empty(): boolean;
    single(): boolean;
    length(): number;
    toExpression(dataCube: DataCube): Expression;
    isRelative(): boolean;
    getSpecificFilter(now: Date, maxTime: Date, timezone: Timezone): Filter;
    private indexOfClause;
    clauseForReference(reference: string): FilterClause;
    addClause(clause: FilterClause): Filter;
    removeClause(reference: string): Filter;
    filteredOn(reference: string): boolean;
    getClauseForDimension({ name }: Dimension): FilterClause;
    getModeForDimension({ name }: Dimension): FilterMode;
    setClause(newClause: FilterClause): Filter;
    mergeClauses(clauses: List<FilterClause>): Filter;
    constrainToDimensions(dimensions: Dimensions): Filter;
    setExclusionForDimension(exclusion: boolean, { name }: Dimension): Filter;
}
export declare const EMPTY_FILTER: Filter;
export {};
