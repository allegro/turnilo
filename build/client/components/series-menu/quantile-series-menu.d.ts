import * as React from "react";
import { Measure } from "../../../common/models/measure/measure";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { QuantileSeries } from "../../../common/models/series/quantile-series";
import { Series } from "../../../common/models/series/series";
import { Binary } from "../../../common/utils/functional/functional";
import "./quantile-series-menu.scss";
interface QuantileSeriesMenuProps {
    measure: Measure;
    initialSeries: Series;
    series: QuantileSeries;
    seriesList: SeriesList;
    onChange: Binary<QuantileSeries, boolean, void>;
}
export declare const QuantileSeriesMenu: React.SFC<QuantileSeriesMenuProps>;
export {};
