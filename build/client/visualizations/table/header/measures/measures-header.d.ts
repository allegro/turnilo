import * as React from "react";
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
import { Sort } from "../../../../../common/models/sort/sort";
interface MeasuresHeaderProps {
    cellWidth: number;
    series: ConcreteSeries[];
    commonSort: Sort;
    showPrevious: boolean;
}
export declare const MeasuresHeader: React.SFC<MeasuresHeaderProps>;
export {};
