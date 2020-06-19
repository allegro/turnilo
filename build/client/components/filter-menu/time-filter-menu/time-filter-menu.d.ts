import * as React from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { Stage } from "../../../../common/models/stage/stage";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../../common/utils/general/general";
import "./time-filter-menu.scss";
export interface TimeFilterMenuProps {
    clicker: Clicker;
    timekeeper: Timekeeper;
    essence: Essence;
    dimension: Dimension;
    onClose: Fn;
    containerStage?: Stage;
    openOn: Element;
    inside?: Element;
}
declare enum TimeFilterTab {
    RELATIVE = "relative",
    FIXED = "fixed"
}
export interface TimeFilterMenuState {
    tab: TimeFilterTab;
}
export declare class TimeFilterMenu extends React.Component<TimeFilterMenuProps, TimeFilterMenuState> {
    state: TimeFilterMenuState;
    selectTab: (tab: TimeFilterTab) => void;
    render(): JSX.Element;
}
export {};
