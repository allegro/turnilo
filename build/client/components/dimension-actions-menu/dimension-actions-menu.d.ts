import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import { Direction } from "../bubble-menu/bubble-menu";
import "./dimension-actions-menu.scss";
export interface DimensionActionsMenuProps {
    openOn: Element;
    direction: Direction;
    containerStage: Stage;
}
export interface DimensionActionsProps {
    clicker: Clicker;
    essence: Essence;
    dimension: Dimension;
    onClose: Fn;
    triggerFilterMenu: (dimension: Dimension) => void;
}
export declare const DimensionActionsMenu: React.SFC<DimensionActionsProps & DimensionActionsMenuProps>;
export declare const DimensionActions: React.SFC<DimensionActionsProps>;
