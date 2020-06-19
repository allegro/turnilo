import { Datum } from "plywood";
import * as React from "react";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import "./total.scss";
export interface TotalProps {
    showPrevious: boolean;
    datum: Datum;
    series: ConcreteSeries;
}
export declare const Total: React.SFC<TotalProps>;
