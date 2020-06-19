import { Dataset } from "plywood";
import { Essence } from "../../../../common/models/essence/essence";
import { ConcreteSeries } from "../../../../common/models/series/concrete-series";
declare type Extent = [number, number];
export declare function extentAcrossSeries(dataset: Dataset, essence: Essence): Extent;
export declare function extentAcrossSplits(dataset: Dataset, essence: Essence, series: ConcreteSeries): Extent;
export {};
