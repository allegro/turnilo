import { PreviewFilterMode } from "../../../client/components/preview-string-filter-menu/preview-string-filter-menu";
import { Dimension } from "../../models/dimension/dimension";
import { Essence } from "../../models/essence/essence";
import { Timekeeper } from "../../models/timekeeper/timekeeper";
interface QueryParams {
    essence: Essence;
    timekeeper: Timekeeper;
    filterMode: PreviewFilterMode;
    searchText: string;
    limit: number;
    dimension: Dimension;
}
export declare function previewStringFilterQuery(params: QueryParams): import("plywood").LimitExpression;
export {};
