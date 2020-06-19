import * as React from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { Filter, FilterMode } from "../../../../common/models/filter/filter";
import { Stage } from "../../../../common/models/stage/stage";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../../common/utils/general/general";
import "./number-filter-menu.scss";
export interface NumberFilterMenuProps {
    clicker: Clicker;
    essence: Essence;
    timekeeper: Timekeeper;
    dimension: Dimension;
    onClose: Fn;
    containerStage?: Stage;
    openOn: Element;
    inside?: Element;
}
export interface NumberFilterMenuState {
    leftOffset?: number;
    rightBound?: number;
    start?: number;
    end?: number;
    significantDigits?: number;
    filterMode?: FilterMode;
}
export declare class NumberFilterMenu extends React.Component<NumberFilterMenuProps, NumberFilterMenuState> {
    mounted: boolean;
    state: NumberFilterMenuState;
    componentWillMount(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    constructFilter(): Filter;
    globalKeyDownListener: (e: KeyboardEvent) => void;
    onOkClick: () => void;
    onCancelClick: () => void;
    onRangeInputStartChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRangeInputEndChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRangeStartChange: (start: number) => void;
    onRangeEndChange: (end: number) => void;
    onSelectFilterOption: (filterMode: FilterMode) => void;
    actionEnabled(): boolean;
    render(): JSX.Element;
}
