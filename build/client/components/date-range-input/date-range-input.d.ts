import { Timezone } from "chronoshift";
import * as React from "react";
import "./date-range-input.scss";
export interface DateRangeInputProps {
    time: Date;
    timezone: Timezone;
    onChange: (t: Date) => void;
    hide?: boolean;
    type?: string;
    label: string;
}
export interface DateRangeInputState {
    dateString?: string;
    timeString?: string;
}
export declare class DateRangeInput extends React.Component<DateRangeInputProps, DateRangeInputState> {
    state: {
        dateString: string;
        timeString: string;
    };
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: DateRangeInputProps): void;
    updateStateFromTime(time: Date, timezone: Timezone): void;
    dateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    timeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    changeDate(possibleDateString: string, possibleTimeString: string): void;
    render(): JSX.Element;
}
