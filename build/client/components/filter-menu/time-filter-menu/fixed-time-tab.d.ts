import * as React from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { DateRange } from "../../../../common/models/date-range/date-range";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { Filter } from "../../../../common/models/filter/filter";
import { TimeShift } from "../../../../common/models/time-shift/time-shift";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../../common/utils/general/general";
export interface FixedTimeTabProps {
    essence: Essence;
    timekeeper: Timekeeper;
    dimension: Dimension;
    onClose: Fn;
    clicker: Clicker;
}
export interface FixedTimeTabState {
    start: Date;
    end: Date;
    shift: string;
}
export declare class FixedTimeTab extends React.Component<FixedTimeTabProps, FixedTimeTabState> {
    initialState: () => FixedTimeTabState;
    onStartChange: (start: Date) => void;
    onEndChange: (end: Date) => void;
    setTimeShift: (shift: string) => void;
    state: FixedTimeTabState;
    createDateRange(): DateRange | null;
    constructFixedFilter(): Filter;
    constructTimeShift(): TimeShift;
    doesTimeShiftOverlap(): boolean;
    validateOverlap(): string | null;
    isTimeShiftValid(): boolean;
    areDatesValid(): boolean;
    isFormValid(): boolean;
    isFilterDifferent(): boolean;
    validate(): boolean;
    onOkClick: () => void;
    render(): JSX.Element;
}
