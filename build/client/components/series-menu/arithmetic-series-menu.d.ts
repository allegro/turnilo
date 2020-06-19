import * as React from "react";
import { Measure } from "../../../common/models/measure/measure";
import { Measures } from "../../../common/models/measure/measures";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { ExpressionSeries } from "../../../common/models/series/expression-series";
import { Series } from "../../../common/models/series/series";
import { Binary } from "../../../common/utils/functional/functional";
import "./arithmetic-series-menu.scss";
interface ArithmeticOperationSeriesMenuProps {
    measure: Measure;
    measures: Measures;
    seriesList: SeriesList;
    series: ExpressionSeries;
    initialSeries: Series;
    onChange: Binary<ExpressionSeries, boolean, void>;
}
export declare const ArithmeticSeriesMenu: React.SFC<ArithmeticOperationSeriesMenuProps>;
export {};
