import * as React from "react";
import { Measure } from "../../../common/models/measure/measure";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { Series } from "../../../common/models/series/series";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
interface AddQuantileSeriesButtonProps {
    addSeries: Unary<Series, void>;
    appendDirtySeries: Unary<Series, void>;
    measure: Measure;
    series: SeriesList;
    onClose: Fn;
}
export declare const AddQuantileSeriesButton: React.SFC<AddQuantileSeriesButtonProps>;
export {};
