import { SeriesDerivation } from "../series/concrete-series";
import { SortDirection } from "../sort/sort";
import { Split } from "./split";
interface SortOpts {
    reference?: string;
    period?: SeriesDerivation;
    direction?: SortDirection;
}
interface SplitOpts {
    limit?: number;
    sort?: SortOpts;
}
export declare function stringSplitCombine(dimension: string, { limit, sort: { direction, period, reference } }?: SplitOpts): Split;
export declare function numberSplitCombine(dimension: string, granularity?: number, { limit, sort: { direction, period, reference } }?: SplitOpts): Split;
export declare function timeSplitCombine(dimension: string, granularity?: string, { limit, sort: { direction, period, reference } }?: SplitOpts): Split;
export {};
