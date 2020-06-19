import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { SortOn } from "../../../../common/models/sort-on/sort-on";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
export interface QueryParams {
    essence: Essence;
    searchText: string;
    sortOn: SortOn;
    timekeeper: Timekeeper;
    dimension: Dimension;
}
export declare function equalParams(params: QueryParams, otherParams: Partial<QueryParams>): boolean;
