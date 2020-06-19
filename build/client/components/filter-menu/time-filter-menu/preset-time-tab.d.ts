import * as React from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { TimeFilterPeriod } from "../../../../common/models/filter-clause/filter-clause";
import { Filter } from "../../../../common/models/filter/filter";
import { TimeShift } from "../../../../common/models/time-shift/time-shift";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../../common/utils/general/general";
export interface PresetTimeTabProps {
    essence: Essence;
    timekeeper: Timekeeper;
    dimension: Dimension;
    clicker: Clicker;
    onClose: Fn;
}
export interface PresetTimeTabState {
    filterPeriod: TimeFilterPeriod;
    filterDuration: string;
    timeShift: string;
}
export declare class PresetTimeTab extends React.Component<PresetTimeTabProps, PresetTimeTabState> {
    setFilter: (filterPeriod: TimeFilterPeriod, filterDuration: string) => void;
    setTimeShift: (timeShift: string) => void;
    state: PresetTimeTabState;
    saveTimeFilter: () => void;
    constructTimeShift(): TimeShift;
    constructRelativeFilter(): Filter;
    doesTimeShiftOverlap(): boolean;
    isTimeShiftValid(): boolean;
    isDurationValid(): boolean;
    validateOverlap(): string | null;
    isFormValid(): boolean;
    isFilterDifferent(): boolean;
    validate(): boolean;
    private renderLatestPresets;
    private renderButtonGroup;
    private getFilterRange;
    render(): JSX.Element;
}
