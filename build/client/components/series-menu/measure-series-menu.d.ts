import * as React from "react";
import { Measure } from "../../../common/models/measure/measure";
import { MeasureSeries } from "../../../common/models/series/measure-series";
import { Binary } from "../../../common/utils/functional/functional";
interface MeasureSeriesMenuProps {
    measure: Measure;
    series: MeasureSeries;
    onChange: Binary<MeasureSeries, boolean, void>;
}
export declare const MeasureSeriesMenu: React.SFC<MeasureSeriesMenuProps>;
export {};
