import { Timezone } from "chronoshift";
import * as React from "react";
import { DateRange } from "../../../../common/models/date-range/date-range";
import { Unary } from "../../../../common/utils/functional/functional";
export interface TimeShiftSelectorProps {
    shift: string;
    time: DateRange;
    timezone: Timezone;
    onShiftChange: Unary<string, void>;
}
export declare const TimeShiftSelector: React.SFC<TimeShiftSelectorProps>;
