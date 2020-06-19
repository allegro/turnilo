import * as React from "react";
import { Measure } from "../../../common/models/measure/measure";
import { Measures } from "../../../common/models/measure/measures";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
interface PlaceholderSeriesTileProps {
    measure: Measure;
    measures: Measures;
    seriesList: SeriesList;
    series: Series;
    style?: React.CSSProperties;
    containerStage: Stage;
    saveSeries: Unary<Series, void>;
    closeItem: Fn;
}
export declare const PlaceholderSeriesTile: React.SFC<PlaceholderSeriesTileProps>;
export {};
