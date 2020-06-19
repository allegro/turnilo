import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Essence } from "../../../common/models/essence/essence";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../common/utils/general/general";
import "./filter-menu.scss";
export interface FilterMenuProps {
    essence: Essence;
    timekeeper: Timekeeper;
    clicker: Clicker;
    containerStage?: Stage;
    openOn: Element;
    dimension: Dimension;
    changePosition: DragPosition;
    onClose: Fn;
    inside?: Element;
}
export declare const FilterMenu: React.SFC<FilterMenuProps>;
