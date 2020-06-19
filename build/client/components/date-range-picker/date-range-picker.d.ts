import { Timezone } from "chronoshift";
import { TimeRange } from "plywood";
import * as React from "react";
import "./date-range-picker.scss";
export interface DateRangePickerProps {
    startTime?: Date;
    endTime?: Date;
    maxTime?: Date;
    timezone: Timezone;
    onStartChange: (t: Date) => void;
    onEndChange: (t: Date) => void;
}
export interface DateRangePickerState {
    activeMonthStartDate?: Date;
    hoverTimeRange?: TimeRange;
    selectionSet?: boolean;
}
export declare class DateRangePicker extends React.Component<DateRangePickerProps, DateRangePickerState> {
    state: DateRangePickerState;
    navigateToMonth(offset: number): void;
    goToPreviousMonth: () => void;
    goToNextMonth: () => void;
    calculateHoverTimeRange(mouseEnteredDay: Date): void;
    onCalendarMouseLeave: () => void;
    selectNewRange(startDate: Date, endDate?: Date): void;
    selectDay(selection: Date): void;
    getIsSelectable(date: Date): boolean;
    renderDays(weeks: Date[][], monthStart: Date): JSX.Element[];
    renderCalendar(startDate: Date): JSX.Element[];
    renderCalendarNav(startDate: Date): JSX.Element;
    render(): JSX.Element;
}
