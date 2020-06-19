import * as d3 from "d3";
import { Datum } from "plywood";
import * as React from "react";
import { ConcreteSeries } from "../../../../../common/models/series/concrete-series";
interface MeasureValueProps {
    series: ConcreteSeries;
    datum: Datum;
    scale: d3.scale.Linear<number, number>;
    cellWidth: number;
    lastLevel: boolean;
    showPrevious: boolean;
    highlight: boolean;
}
export declare const MeasureValue: React.SFC<MeasureValueProps>;
export {};
