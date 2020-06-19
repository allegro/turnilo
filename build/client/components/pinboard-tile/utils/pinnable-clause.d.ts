import { BooleanFilterClause, FilterClause, StringFilterClause } from "../../../../common/models/filter-clause/filter-clause";
export declare type PinnableClause = StringFilterClause | BooleanFilterClause;
export declare function isPinnableClause(clause?: FilterClause): clause is PinnableClause;
