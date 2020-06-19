import * as React from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { DragPosition } from "../../../../common/models/drag-position/drag-position";
import { Essence } from "../../../../common/models/essence/essence";
import { FilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Filter, FilterMode } from "../../../../common/models/filter/filter";
import { Stage } from "../../../../common/models/stage/stage";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../../common/utils/general/general";
import { FilterOption } from "../../filter-options-dropdown/filter-options-dropdown";
import "./string-filter-menu.scss";
export interface StringFilterMenuProps {
    clicker: Clicker;
    dimension: Dimension;
    essence: Essence;
    timekeeper: Timekeeper;
    changePosition: DragPosition;
    onClose: Fn;
    containerStage?: Stage;
    openOn: Element;
    inside?: Element;
}
export interface StringFilterMenuState {
    filterMode?: FilterMode;
}
export declare class StringFilterMenu extends React.Component<StringFilterMenuProps, StringFilterMenuState> {
    private initialFilterMode;
    state: StringFilterMenuState;
    onSelectFilterOption: (filterMode: FilterMode) => void;
    updateFilter: (clause: FilterClause) => Filter;
    getFilterOptions(): FilterOption[];
    renderFilterControls(): JSX.Element;
    render(): JSX.Element;
}
