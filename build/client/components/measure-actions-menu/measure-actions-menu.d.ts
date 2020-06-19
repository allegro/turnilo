import * as React from "react";
import { Measure } from "../../../common/models/measure/measure";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { Direction } from "../bubble-menu/bubble-menu";
import "./measure-actions-menu.scss";
export interface MeasureActionsMenuProps {
    direction: Direction;
    containerStage: Stage;
    openOn: Element;
}
export interface MeasureActionsProps {
    appendDirtySeries: Unary<Series, void>;
    addSeries: Unary<Series, void>;
    series: SeriesList;
    measure: Measure;
    onClose: Fn;
}
export declare const MeasureActionsMenu: React.SFC<MeasureActionsMenuProps & MeasureActionsProps>;
