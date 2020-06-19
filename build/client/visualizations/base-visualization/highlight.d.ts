import { List } from "immutable";
import { FilterClause } from "../../../common/models/filter-clause/filter-clause";
export declare class Highlight {
    readonly clauses: List<FilterClause>;
    readonly key: string | null;
    constructor(clauses: List<FilterClause>, key: string | null);
}
