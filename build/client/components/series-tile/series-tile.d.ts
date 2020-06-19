import * as React from "react";
import { Measures } from "../../../common/models/measure/measures";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { ConcreteSeries } from "../../../common/models/series/concrete-series";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Binary, Ternary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
interface SeriesTileProps {
    item: ConcreteSeries;
    open: boolean;
    seriesList: SeriesList;
    measures: Measures;
    style?: React.CSSProperties;
    removeSeries: Unary<Series, void>;
    updateSeries: Binary<Series, Series, void>;
    openSeriesMenu: Unary<Series, void>;
    closeSeriesMenu: Fn;
    dragStart: Ternary<string, Series, React.DragEvent<HTMLElement>, void>;
    containerStage: Stage;
}
export declare const SeriesTile: React.SFC<SeriesTileProps>;
export {};
