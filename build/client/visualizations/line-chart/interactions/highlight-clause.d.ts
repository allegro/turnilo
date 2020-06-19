import { FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { ContinuousRange } from "../utils/continuous-types";
export declare function toFilterClause(range: ContinuousRange, reference: string): FilterClause;
export declare function toPlywoodRange(clause: FilterClause): ContinuousRange;
