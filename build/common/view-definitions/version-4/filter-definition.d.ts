import { DataCube } from "../../models/data-cube/data-cube";
import { Dimension } from "../../models/dimension/dimension";
import { FilterClause, StringFilterAction } from "../../models/filter-clause/filter-clause";
export declare enum FilterType {
    boolean = "boolean",
    number = "number",
    string = "string",
    time = "time"
}
export interface BaseFilterClauseDefinition {
    type: FilterType;
    ref: string;
}
export interface NumberFilterClauseDefinition extends BaseFilterClauseDefinition {
    type: FilterType.number;
    not: boolean;
    ranges: Array<{
        start: number;
        end: number;
        bounds?: string;
    }>;
}
export interface StringFilterClauseDefinition extends BaseFilterClauseDefinition {
    type: FilterType.string;
    action: StringFilterAction;
    not: boolean;
    values: string[];
}
export interface BooleanFilterClauseDefinition extends BaseFilterClauseDefinition {
    type: FilterType.boolean;
    not: boolean;
    values: Array<boolean | string>;
}
export interface TimeFilterClauseDefinition extends BaseFilterClauseDefinition {
    type: FilterType.time;
    timeRanges?: Array<{
        start: string;
        end: string;
    }>;
    timePeriods?: TimePeriodDefinition[];
}
declare type TimePeriodType = "latest" | "floored";
export interface TimePeriodDefinition {
    type: TimePeriodType;
    duration: string;
    step: number;
}
export declare type FilterClauseDefinition = BooleanFilterClauseDefinition | NumberFilterClauseDefinition | StringFilterClauseDefinition | TimeFilterClauseDefinition;
export interface FilterDefinitionConversion<In extends FilterClauseDefinition, Out> {
    toFilterClause(filter: In, dimension: Dimension): Out;
    fromFilterClause(filterClause: Out): In;
}
export interface FilterDefinitionConverter {
    toFilterClause(filter: FilterClauseDefinition, dataCube: DataCube): FilterClause;
    fromFilterClause(filterClause: FilterClause): FilterClauseDefinition;
}
export declare const filterDefinitionConverter: FilterDefinitionConverter;
export {};
