import * as React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import "./number-range-picker.scss";
export declare const ANY_VALUE: any;
export interface NumberRangePickerProps {
    start: number;
    end: number;
    essence: Essence;
    timekeeper: Timekeeper;
    dimension: Dimension;
    onRangeStartChange: (n: number) => void;
    onRangeEndChange: (n: number) => void;
    exclude: boolean;
}
export interface NumberRangePickerState {
    leftOffset?: number;
    rightBound?: number;
    min?: number;
    max?: number;
    step?: number;
    loading?: boolean;
    error?: any;
}
export declare class NumberRangePicker extends React.Component<NumberRangePickerProps, NumberRangePickerState> {
    mounted: boolean;
    private picker;
    constructor(props: NumberRangePickerProps);
    fetchData(essence: Essence, timekeeper: Timekeeper, dimension: Dimension, rightBound: number): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    relativePositionToValue(position: number, type: "start" | "end"): any;
    valueToRelativePosition(value: number): number;
    onBarClick(positionStart: number, positionEnd: number, e: MouseEvent): void;
    updateStart: (absolutePosition: number) => void;
    updateEnd: (absolutePosition: number) => void;
    render(): JSX.Element;
}
