import { List } from "immutable";
import { PseudoDatum } from "plywood";
import { FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Splits } from "../../../../common/models/splits/splits";
export declare function getFilterFromDatum(splits: Splits, flatDatum: PseudoDatum): List<FilterClause>;
