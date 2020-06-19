import * as React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Binary, Ternary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { Placeholder } from "./series-tiles-row";
export declare const SERIES_CLASS_NAME = "series";
interface SeriesTilesProps {
    menuStage: Stage;
    maxItems: number;
    essence: Essence;
    removeSeries: Unary<Series, void>;
    updateSeries: Binary<Series, Series, void>;
    openedSeriesMenu?: Series;
    openSeriesMenu: Unary<Series, void>;
    closeSeriesMenu: Fn;
    dragStart: Ternary<string, Series, React.DragEvent<HTMLElement>, void>;
    placeholderSeries?: Placeholder;
    removePlaceholderSeries: Fn;
    savePlaceholderSeries: Unary<Series, void>;
    overflowOpen: boolean;
    closeOverflowMenu: Fn;
    openOverflowMenu: Fn;
}
export declare const SeriesTiles: React.SFC<SeriesTilesProps>;
export {};
