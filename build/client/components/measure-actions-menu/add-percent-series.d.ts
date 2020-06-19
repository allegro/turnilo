import * as React from "react";
import { Measure } from "../../../common/models/measure/measure";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { Series } from "../../../common/models/series/series";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
interface AddPercentSeriesButtonProps {
    addSeries: Unary<Series, void>;
    series: SeriesList;
    measure: Measure;
    onClose: Fn;
}
export declare const AddPercentSeriesButton: React.SFC<AddPercentSeriesButtonProps>;
export {};
