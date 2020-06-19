import { FilterClause, FixedTimeFilterClause, NumberFilterClause } from "../../../../common/models/filter-clause/filter-clause";
export declare function isValidClause(clause: FilterClause): clause is FixedTimeFilterClause | NumberFilterClause;
