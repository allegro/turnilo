import { Expression } from "plywood";
import { Dimension } from "../../models/dimension/dimension";
import { Essence } from "../../models/essence/essence";
import { Timekeeper } from "../../models/timekeeper/timekeeper";
interface QueryParams {
    essence: Essence;
    timekeeper: Timekeeper;
    limit: number;
    dimension: Dimension;
    searchText: string;
}
export declare function stringFilterOptionsQuery({ essence, timekeeper, limit, dimension, searchText }: QueryParams): Expression;
export {};
