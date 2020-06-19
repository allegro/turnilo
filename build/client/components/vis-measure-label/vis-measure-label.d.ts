import { Datum } from "plywood";
import * as React from "react";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import "./vis-measure-label.scss";
export interface VisMeasureLabelProps {
    series: ConcreteSeries;
    datum: Datum;
    showPrevious: boolean;
}
export declare const VisMeasureLabel: React.SFC<VisMeasureLabelProps>;
