import { Dataset, PlywoodRange } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
interface SeriesHoverContentProps {
    essence: Essence;
    dataset: Dataset;
    range: PlywoodRange;
    series: ConcreteSeries;
}
export declare const SeriesHoverContent: React.SFC<SeriesHoverContentProps>;
export {};
