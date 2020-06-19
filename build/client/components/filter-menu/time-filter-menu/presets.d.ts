import { Expression } from "plywood";
import { TimeFilterPeriod } from "../../../../common/models/filter-clause/filter-clause";
import { TimeShift } from "../../../../common/models/time-shift/time-shift";
export interface TimeFilterPreset {
    name: string;
    duration: string;
}
export declare const LATEST_PRESETS: TimeFilterPreset[];
export declare const CURRENT_PRESETS: TimeFilterPreset[];
export declare const PREVIOUS_PRESETS: TimeFilterPreset[];
export interface ShiftPreset {
    label: string;
    shift: TimeShift;
}
export declare const COMPARISON_PRESETS: ShiftPreset[];
export declare function constructFilter(period: TimeFilterPeriod, duration: string): Expression;
export declare function getTimeFilterPresets(period: TimeFilterPeriod): TimeFilterPreset[];
