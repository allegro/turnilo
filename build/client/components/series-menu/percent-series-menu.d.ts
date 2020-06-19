import * as React from "react";
import { Measure } from "../../../common/models/measure/measure";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { ExpressionSeries } from "../../../common/models/series/expression-series";
import { Binary } from "../../../common/utils/functional/functional";
import "./percent-series-menu.scss";
interface PercentSeriesMenuProps {
    measure: Measure;
    series: ExpressionSeries;
    seriesList: SeriesList;
    onChange: Binary<ExpressionSeries, boolean, void>;
}
export declare const PercentSeriesMenu: React.SFC<PercentSeriesMenuProps>;
export {};
